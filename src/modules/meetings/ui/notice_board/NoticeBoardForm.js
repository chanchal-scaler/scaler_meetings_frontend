import React, { useCallback, useEffect } from 'react';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { Icon, Modal } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';
import NoticeBoardTab from './NoticeBoardTab';
import NoticeBoardTabsBar from './NoticeBoardTabsBar';

function NoticeBoardForm({ meetingStore: store }) {
  const { meeting } = store;
  const { noticeBoard } = meeting;

  useEffect(() => {
    if (!noticeBoard.hasLoadedTemplates && !noticeBoard.isLoadingTemplates) {
      noticeBoard.loadTemplates(meeting.slug);
    }
  }, [meeting.slug, noticeBoard]);

  const handleClose = useCallback(() => {
    noticeBoard.setFormOpen(false);
    noticeBoard.resetFormState();
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardModalClose,
      click_source: DRONA_SOURCES.meetingNoticeBoardModal,
      click_feature: DRONA_FEATURES.noticeBoard,
    });
  }, [noticeBoard]);

  return (
    <Modal
      isOpen={noticeBoard.formOpen}
      onClose={handleClose}
      unMountOnClose
      headerClassName="m-notice-board-form__header"
      className="m-notice-board-form"
      containerClassName="m-notice-board-form__body"
      title={(
        <div className="row align-c">
          <Icon className="m-r-10" name="noticeboard-filled" />
          Pin to Notice Board
        </div>
      )}
    >
      {
        noticeBoard.templates
          && noticeBoard.templates.length > 0
          && <NoticeBoardTabsBar />
      }
      <NoticeBoardTab />
    </Modal>
  );
}

export default mobxify('meetingStore')(NoticeBoardForm);
