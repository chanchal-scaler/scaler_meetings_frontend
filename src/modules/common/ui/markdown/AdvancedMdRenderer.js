import React, { useCallback, useState, useEffect } from 'react';
import classNames from 'classnames';

import { advancedMdToHtml } from './mdToHtml';
import { isFunction } from '@common/utils/type';
import { useUnmountedRef } from '@common/hooks';

function AdvancedMdRenderer({
  className,
  mdString,
  options = {},
  parseEmojis = true,
  parseLinks = true,
  parseMathExpressions = false,
  parseCode = false,
  onRenderComplete,
}) {
  const [parsedString, setParsedString] = useState(null);

  const unMountedRef = useUnmountedRef();

  const loadParsedString = useCallback(async () => {
    setParsedString(null);
    const res = await advancedMdToHtml({
      mdString,
      options,
      parseEmojis,
      parseLinks,
      parseMathExpressions,
      parseCode,
    });

    // The below check make's sure to
    // execute the callback only when the component is mounted
    if (unMountedRef.current) {
      return;
    }

    setParsedString({ __html: res });
    if (isFunction(onRenderComplete)) {
      onRenderComplete();
    }
  }, [
    mdString,
    options,
    parseEmojis,
    parseLinks,
    parseMathExpressions,
    unMountedRef,
    parseCode,
    onRenderComplete,
  ]);

  useEffect(() => {
    loadParsedString();
  }, [loadParsedString]);

  return (
    <div
      className={classNames('md-renderer', { [className]: className })}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={parsedString}
    />
  );
}

export default AdvancedMdRenderer;
