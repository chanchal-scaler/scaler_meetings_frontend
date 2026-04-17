import React, { useCallback } from 'react';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';
import NoticeBoardFormBody from './NoticeBoardFormBody';
import NoticeBoardFormTemplates from './NoticeBoardFormTemplates';

function NoticeBoardTab({ meetingStore: store }) {
  const { meeting } = store;
  const { noticeBoard } = meeting;

  const handleClose = useCallback(() => {
    noticeBoard.setFormOpen(false);
    noticeBoard.resetFormState();
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardModalClose,
      click_source: DRONA_SOURCES.meetingNoticeBoardModal,
      click_feature: DRONA_FEATURES.noticeBoard,
    });
  }, [noticeBoard]);

  switch (meeting.activeNoticeBoardTab) {
    case 'general':
      return (<NoticeBoardFormBody onClose={handleClose} />);
    case 'template':
      return <NoticeBoardFormTemplates onClose={handleClose} />;
    default:
      return null;
  }
}

export default mobxify('meetingStore')(NoticeBoardTab);
