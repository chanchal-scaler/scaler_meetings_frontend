import React, { useCallback, useEffect, useState } from 'react';

import { CircularLoader } from '@common/ui/general';
import { LoadingLayout } from '@common/ui/layouts';
import QRCodeApi from '~meetings/api/qrcode';
import { mobxify } from '~meetings/ui/hoc';
import {
  getAttachmentInitUrl, xmlToSvgUrl, updateFileTypeIfRequired,
} from '~meetings/utils/attachments';
import FileItem from './FileItem';
import FileDragDrop from './FileDragDrop';
import FileSelect from './FileSelect';

function NotesUpload({
  attachmentStore,
  skipInstructions,
  meetingSlug,
  source,
  accessToken = null,
}) {
  const {
    allAttachments: attachments,
    allAttachmentsCount,
    isLoading,
  } = attachmentStore;
  const [QRCode, setQRCOde] = useState(null);

  useEffect(() => {
    attachmentStore.setData({
      token: accessToken,
      postUrl: getAttachmentInitUrl(meetingSlug),
      source,
      meetingSlug,
    });
    attachmentStore.loadAttachments();
  }, [attachmentStore, accessToken, meetingSlug, source]);

  useEffect(() => {
    const fetchQRCode = async () => {
      const resp = await QRCodeApi.getQRCode(meetingSlug);
      const { code } = resp;
      setQRCOde(xmlToSvgUrl(code));
    };
    if (!skipInstructions) { fetchQRCode(); }
  }, [skipInstructions, meetingSlug]);

  const handleFileDrop = useCallback((fileList) => {
    for (let idx = 0; idx < fileList.length; idx += 1) {
      const fileObject = updateFileTypeIfRequired(fileList.item(idx));
      attachmentStore.enqueueAttachment(fileObject);
    }
  }, [attachmentStore]);

  const qrCodeUi = () => (
    <div className="lecture-notes__qr-code">
      { QRCode ? (
        <img
          src={QRCode}
          alt="qr-code"
        />
      ) : (
        <CircularLoader
          size={120}
          style={{ display: 'inline-block' }}
        />
      ) }
    </div>
  );

  const stepsUi = () => (
    <div className="lecture-notes__top">
      <div className="lecture-notes__top-content">
        <div className="lecture-notes__heading">
          We get frequent requests for your notes!
        </div>
        <div className="lecture-notes__subheading">
          Notes written by you helps in understanding the topic
          &nbsp;better. You can upload the notes in two
          &nbsp;simple steps mentioned below
        </div>
        <div className="lecture-notes__steps">
          <div className="lecture-notes__steps-row">
            <div className="lecture-notes__steps-count">
              1
            </div>
            <div className="lecture-notes__steps-content">
              <div className="lecture-notes__steps--header">
                Scan the QR code with your iPad
              </div>
              <div className="lecture-notes__steps--subheader">
                Scanner should be present in the top menu on your iPad
              </div>
            </div>
          </div>
          <div className="lecture-notes__steps-row">
            <div className="lecture-notes__steps-count">
              2
            </div>
            <div className="lecture-notes__steps-content">
              <div className="lecture-notes__steps--header">
                Upload Notes on the generated link
              </div>
              <div className="lecture-notes__steps--subheader">
                All notes uploaded will be
                &nbsp;visible in the saved version of this session
              </div>
            </div>
          </div>
        </div>
      </div>
      {qrCodeUi()}
    </div>
  );

  const breakUi = () => (
    <div className="lecture-notes__seperator">
      OR
    </div>
  );

  const instructionsUi = () => {
    if (skipInstructions) {
      return null;
    }
    return (
      <>
        {stepsUi()}
        {breakUi()}
      </>
    );
  };

  const attachmentListUi = () => {
    if (isLoading) {
      return (
        <LoadingLayout
          isTransparent
          isFit
          small
        />
      );
    } else if (allAttachmentsCount === 0) {
      return (
        <span>
          Files Uploaded from your computer appear here
        </span>
      );
    } else {
      return (
        attachments.map((attachment, index) => (
          <FileItem
            key={index}
            slug={meetingSlug}
            attachment={attachment}
          />
        ))
      );
    }
  };

  const fileDragDropUi = () => (
    <FileDragDrop onDrop={handleFileDrop}>
      <div className="lecture-notes__file-drop">
        <div className="lecture-notes__file-drop-header">
          <span className="lecture-notes__file-drop--drop">
            Drag and drop files
          </span>
          {' '}
          or
          {' '}
          <FileSelect onChange={handleFileDrop}>
            <span className="lecture-notes__file-drop--select">
              click here to upload
            </span>
          </FileSelect>
        </div>
        <div className="lecture-notes__files-list">
          {attachmentListUi()}
        </div>
      </div>
    </FileDragDrop>
  );

  return (
    <div className="lecture-notes">
      {instructionsUi()}
      <div className="lecture-notes__bottom">
        {fileDragDropUi()}
      </div>
    </div>
  );
}

export default mobxify('attachmentStore')(NotesUpload);
