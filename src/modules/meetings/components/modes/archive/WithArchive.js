import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { ActionTypes, hasAttachments } from '~meetings/utils/attachments';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { Modal } from '@common/ui/general';
import { NotesUpload } from '~meetings/ui/lecture_notes';
import CustomHeaderActions from '~meetings/ui/CustomHeaderActions';

function WithArchive({
  attachmentStore,
  children,
  meetingStore: store,
  headerActions,
}) {
  const { archive } = store;
  const { slug } = store.data;

  useEffect(() => {
    store.loadArchive(slug);
  }, [slug, store]);

  useEffect(() => {
    if (archive) {
      return () => archive.destroy();
    } else {
      return undefined;
    }
  }, [archive]);

  useEffect(() => {
    attachmentStore.track(ActionTypes.ARCHIVE_LECURE_OPENED);
  }, [attachmentStore]);

  if (!archive) {
    return null;
  } else if (archive.isLoading) {
    return <LoadingLayout isTransparent />;
  } else if (archive.loadError) {
    return (
      <div className="archive-error flex-fill">
        <div className="row m-l-5 m-t-5">
          <CustomHeaderActions actions={headerActions} mode="archive" />
        </div>
        <HintLayout
          isTransparent
          message={archive.loadErrorMessage}
          actionLabel="Try again"
          actionFn={() => archive.load(slug)}
        />
      </div>
    );
  } else {
    return (
      <>
        {children({ archive })}
        {hasAttachments(archive.type) && archive.isSuperHost && (
          <Modal
            isFlat
            isOpen={attachmentStore.isUploadModalOpen}
            onClose={() => attachmentStore.setUploadModalState(false)}
            title="Upload Lecture Notes"
            unMountOnClose
          >
            <NotesUpload
              meetingSlug={slug}
              shouldLoad={false}
              source={ActionTypes.ARCHIVE_UPLOAD}
            />
          </Modal>
        )}
      </>
    );
  }
}

WithArchive.propTypes = {
  children: PropTypes.func.isRequired,
};

export default mobxify('meetingStore', 'attachmentStore')(WithArchive);
