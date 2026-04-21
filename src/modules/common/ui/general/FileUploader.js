/* eslint-disable no-unused-expressions */
import React, {
  createElement, useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getHumanReadableFileSize } from '@common/utils/file';
import { toast } from './Toast';
import * as CustomPropTypes from '@common/utils/propTypes';

async function upload({
  dataKey, file, method, path, prompt, customData,
}) {
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  let filename = file.name;
  if (prompt) {
    // eslint-disable-next-line no-alert
    filename = window.prompt('Specify the name for the file', file.name);
  }

  const body = new FormData();
  body.append(dataKey, file, filename || file.name);

  if (customData) {
    Object.keys(customData).forEach((key) => {
      body.append(key, customData[key]);
    });
  }

  const response = await fetch(path, {
    body,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-CSRF-Token': csrfMeta.content,
      'X-Requested-With': 'XMLHttpRequest',
    },
    method,
  });
  const json = await response.json();
  return json;
}

function FileUploader({
  className,
  component = 'a',
  dataKey = 'attachment',
  inputProps = {},
  method = 'POST',
  onClick,
  onFail,
  onSuccess,
  path,
  progressClassName = 'file-uploader--progress',
  disableProgress,
  prompt = false,
  onUploadStart,
  maxAllowedSize,
  customData,
  triggerClick = 0,
  convertToWebp,
  ...remainingProps
}) {
  const ref = useRef(null);
  const [isUploading, setUploading] = useState(false);

  const handleClick = useCallback((event) => {
    ref.current.click();
    onClick && onClick(event);
  }, [onClick]);

  useEffect(() => {
    if (triggerClick) {
      handleClick();
    }
  }, [triggerClick, handleClick]);

  const handleFileUpload = useCallback(async (event) => {
    let file = event.target.files[0];
    if (!file) return;

    if (convertToWebp) {
      file = await convertToWebp(file);
    }

    if (maxAllowedSize && file.size > maxAllowedSize) {
      const fileSize = getHumanReadableFileSize(maxAllowedSize);
      toast.show({
        message: `Max allowed file size is ${fileSize}`,
        type: 'error',
      });
      return;
    }

    setUploading(true);
    onUploadStart && onUploadStart();
    try {
      const json = await upload({
        dataKey, file, method, path, prompt, customData,
      });
      onSuccess && onSuccess(json, file);
    } catch (error) {
      onFail && onFail(error);
    }
    setUploading(false);
  }, [
    maxAllowedSize, onUploadStart, dataKey, method, path,
    prompt, onSuccess, onFail, customData, convertToWebp,
  ]);

  function inputUi() {
    return (
      <input
        ref={ref}
        hidden
        onChange={handleFileUpload}
        type="file"
        {...inputProps}
      />
    );
  }

  function triggerUi() {
    return createElement(
      component,
      {
        className: classNames(
          'file-uploader',
          { [progressClassName]: isUploading && !disableProgress },
          { [className]: className },
        ),
        disabled: isUploading,
        onClick: handleClick,
        ...remainingProps,
      },
    );
  }

  return (
    <>
      {inputUi()}
      {triggerUi()}
    </>
  );
}

FileUploader.propTypes = {
  className: PropTypes.string,
  component: CustomPropTypes.componentPropType.isRequired,
  dataKey: PropTypes.string.isRequired,
  inputProps: PropTypes.object.isRequired,
  maxAllowedSize: PropTypes.number,
  method: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  onFail: PropTypes.func,
  onSuccess: PropTypes.func,
  path: PropTypes.string.isRequired,
  progressClassName: PropTypes.string,
  prompt: PropTypes.bool.isRequired,
  triggerClick: PropTypes.number,
};

export default FileUploader;
