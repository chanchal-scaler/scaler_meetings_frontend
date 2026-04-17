import React, { useCallback, useEffect } from 'react';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { dialog } from '@common/ui/general/Dialog';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { Tappable } from '@common/ui/general';
import analytics from '@common/utils/analytics';
import NoticeBoardCard from './NoticeBoardCard';

function NoticeBoard({ meetingStore: store }) {
  const { archive, meeting } = store || {};
  const meetingModel = archive || meeting;
  const { noticeBoard } = meetingModel || {};

  const canAddOrDelete = !archive && meeting.isSuperHost;

  const handleCreateFormOpen = useCallback(() => {
    noticeBoard.setFormOpen(true);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardAddButtonClick,
      click_source: DRONA_SOURCES.meetingNoticeBoardTab,
      click_feature: DRONA_FEATURES.noticeBoard,
    });
  }, [noticeBoard]);

  const onDelete = useCallback((messageId) => {
    noticeBoard.unpinMessage(messageId);
  }, [noticeBoard]);

  useEffect(() => {
    if (!archive && meeting?.isJoined) {
      noticeBoard.resetUnreadMessageCount();
    }
  }, [archive, meeting, noticeBoard]);

  const handleDelete = useCallback((pinId) => {
    dialog.areYouSure({
      name: 'meeting-app',
      content: 'Are you sure you want to delete the message?',
      okLabel: 'Yes',
      onOk: () => {
        onDelete(pinId);
        analytics.click({
          click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardDeleteMessageClick,
          click_source: DRONA_SOURCES.meetingNoticeBoardTab,
          click_feature: DRONA_FEATURES.noticeBoard,
        });
      },
    });
  }, [onDelete]);

  if (meeting?.isLoading) {
    return <LoadingLayout />;
  } else if (meeting?.loadError) {
    return (
      <HintLayout
        actionLabel="Try again"
        heading="Failed to load messages."
      />
    );
  } else if (noticeBoard) {
    return (
      <div className="layout__content m-notice-board">
        {canAddOrDelete && (
          <Tappable
            onClick={handleCreateFormOpen}
            className="m-notice-board-create-button no-highlight"
          >
            <span className="m-r-5 h3">+</span>
            Add
          </Tappable>
        )}
        {noticeBoard.messages.length === 0 && (
          <div className="m-notice-board-empty">
            <div>
              No Message Added Yet!
            </div>
            <div className="h5">
              Watch this space for important messages and announcements.
            </div>
          </div>
        )}
        <div className="m-notice-board-card-container">
          {noticeBoard.messages.map((message) => (
            <NoticeBoardCard
              key={message.pinId}
              message={message}
              onDelete={handleDelete}
              canDelete={canAddOrDelete}
            />
          ))}
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(NoticeBoard);
