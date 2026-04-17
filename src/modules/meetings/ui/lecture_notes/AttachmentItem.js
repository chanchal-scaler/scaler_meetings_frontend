import React, { useState } from 'react';

import {
  downloadFileFromLink,
  getIconFromMime,
  getLabelFromMime,
  getTypeFromMime,
  getHumanReadableFileSize,
} from '@common/utils/file';
import { Icon } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { ActionTypes } from '~meetings/utils/attachments';

function AttachmentItem({ attachment, attachmentStore }) {
  const [isDownloading, setDownloading] = useState(false);
  const { file, url } = attachment;
  const {
    type, name, size,
  } = file;
  const fileIcon = getIconFromMime(type);
  const fileLabel = getLabelFromMime(type);
  const fileType = getTypeFromMime(type);
  const fileSize = getHumanReadableFileSize(size);

  const downloadMedia = (event) => {
    event.preventDefault();

    if (isDownloading) return;
    setDownloading(true);
    downloadFileFromLink(url, name);
    setDownloading(false);
    attachmentStore.track(ActionTypes.ATTACHMENT_DOWNLOADED);
  };

  return (
    <a
      href="/"
      onClick={downloadMedia}
    >
      <div
        className="lecture-notes__download"
        role="presentation"
      >
        <div className="lecture-notes__download-icon">
          <Icon name={fileIcon} />
        </div>
        <div className="lecture-notes__download-content">
          <div className="lecture-notes__download-name">
            {name || fileLabel}
          </div>
          <div className="lecture-notes__download-info">
            <div>
              {fileSize}
            </div>
            <div>
              {fileType}
            </div>
          </div>
        </div>
        <div className="lecture-notes__download-action">
          <Icon name="arrow-down" />
        </div>
      </div>
    </a>
  );
}

export default mobxify('attachmentStore')(AttachmentItem);
