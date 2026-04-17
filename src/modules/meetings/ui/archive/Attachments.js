import React, { useCallback, useEffect } from 'react';

import { ActionTypes, getAttachmentInitUrl } from '~meetings/utils/attachments';
import { AttachmentItem } from '~meetings/ui/lecture_notes';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';

function Attachments({ attachmentStore, meetingStore }) {
  const {
    availableAttachments: attachments,
    isLoading,
    hasError,
  } = attachmentStore;
  const { archive } = meetingStore;
  const { slug } = archive;

  useEffect(() => {
    attachmentStore.setData({
      postUrl: getAttachmentInitUrl(slug),
      meetingSlug: slug,
    });
    attachmentStore.loadAttachments();
  }, [slug, attachmentStore, archive]);

  useEffect(() => {
    attachmentStore.track(ActionTypes.ATTACHMENTS_TAB_OPENED);
  }, [attachmentStore]);

  const handleReload = useCallback(() => {
    attachmentStore.reloadAttachments();
  }, [attachmentStore]);

  function listUi() {
    if (isLoading) {
      return <LoadingLayout />;
    } else if (hasError) {
      return (
        <div className="lecture-notes__retry">
          <HintLayout
            actionLabel="Try again"
            actionFn={handleReload}
            message="Failed to load lecture notes"
          />
        </div>
      );
    } else if (attachments.length === 0) {
      return <HintLayout message="No lecture notes added" />;
    } else {
      return (
        <div className="lecture-notes__download-list">
          {attachments
            .map((attachment, index) => (
              <AttachmentItem
                attachment={attachment}
                key={index}
              />
            ))}
        </div>
      );
    }
  }

  return (
    <div className="layout__content">
      <div className="layout">
        {archive && archive.isSuperHost && (
          <div className="p-10">
            <button
              className="btn btn-primary bold full-width m-b-5 cursor"
              type="button"
              onClick={() => attachmentStore.setUploadModalState(true)}
            >
              Modify notes
            </button>
            <span className="hint h6">
              You can add or remove lecture notes here
            </span>
          </div>
        )}
        <div className="layout__content">
          {listUi()}
        </div>
      </div>
    </div>
  );
}

export default mobxify('meetingStore', 'attachmentStore')(Attachments);
