import React, { useCallback } from 'react';

import { CircularLoader } from '@common/ui/general';

import { UploadStatus } from '~meetings/utils/attachments';

function FileItem({ attachment }) {
  const { status, file } = attachment;
  const { name } = file;

  const handleRemove = useCallback((skipApiCall = false) => () => {
    attachment.delete(skipApiCall);
  }, [attachment]);

  const handleRetry = useCallback(() => {
    attachment.retry();
  }, [attachment]);

  const startedUi = () => (
    <>
      <CircularLoader
        size={15}
        style={{ display: 'inline-block' }}
      />
      <span>
        &nbsp;Uploading
      </span>
    </>
  );

  const successUi = () => (
    <span className="lecture-notes__file-status--success">
      Uploaded Successfully!
    </span>
  );

  const failureUi = () => (
    <span className="lecture-notes__file-status--fail">
      Upload Failed!
    </span>
  );

  const statusUi = () => {
    let ui = null;
    switch (status) {
      case UploadStatus.SUCCESS: ui = successUi(); break;
      case UploadStatus.FAILURE: ui = failureUi(); break;
      case UploadStatus.STARTED: ui = startedUi(); break;
      default: break;
    }

    return ui;
  };

  const actionUi = () => {
    if (status === UploadStatus.SUCCESS) {
      return (
        <span
          className="lecture-notes__file-action-item"
          onClick={handleRemove()}
          role="presentation"
        >
          Remove
        </span>
      );
    } else if (status === UploadStatus.FAILURE) {
      return (
        <>
          <span
            className="lecture-notes__file-action-item"
            onClick={handleRetry}
            role="presentation"
          >
            Retry
          </span>
          <span
            className="lecture-notes__file-action-item"
            onClick={handleRemove(true)}
            role="presentation"
          >
            Cancel
          </span>
        </>
      );
    }

    return null;
  };

  const pendingClass = (status === UploadStatus.PENDING)
    ? 'lecture-notes__files-list-row--pending' : null;

  return (
    <div
      className={`lecture-notes__files-list-row ${pendingClass}`}
    >
      <div className="lecture-notes__file-name">
        {name}
      </div>
      <div className="lecture-notes__file-status">
        {statusUi()}
      </div>
      <div className="lecture-notes__file-action">
        {actionUi()}
      </div>
    </div>
  );
}

export default FileItem;
