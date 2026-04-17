import React, { useCallback } from 'react';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { hasAttachments } from '~meetings/utils/attachments';
import { canCreateBookmarks } from '~meetings/utils/meeting';
import { DockItem } from '~meetings/ui/general';
import { MEETING_TABS } from '~meetings/utils/constants';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaQuery } from '@common/hooks';
import analytics from '@common/utils/analytics';

function RightDock({ meetingStore: store, attachmentStore }) {
  const { archive } = store;
  const newNoticeBoardEnabled = archive.config?.newNoticeBoardEnabled;
  const { tablet } = useMediaQuery();

  const { availableAttachmentsCount } = attachmentStore;

  const handleChatTabClick = useCallback(() => {
    archive.setActiveTab('chat');
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaOpenChatClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_feature: DRONA_FEATURES.chat,
      custom: {
        is_live: false,
      },
    });
  }, [archive]);

  const handleNoticeBoardTabClick = useCallback(() => {
    archive.setActiveTab(MEETING_TABS.noticeBoard);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaOpenNoticeBoardClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_feature: DRONA_FEATURES.noticeBoard,
      custom: {
        is_live: false,
      },
    });
  }, [archive]);

  if (!tablet) {
    return (
      <div className="right-dock scroll">
        <div className="right-dock__tabs">
          <DockItem
            className="right-dock__tab"
            icon="chat"
            label="Chat"
            data-cy="archived-meetings-sidebar-chat-tab"
            isActive={archive.activeTab === 'chat'}
            onClick={handleChatTabClick}
          />
          {canCreateBookmarks(archive.type) && (
            <DockItem
              badge={archive.hasBookmarks && archive.numBookmarks}
              className="right-dock__tab"
              icon="bookmark"
              data-cy="archived-meetings-sidebar-bookmark-tab"
              label="Bookmarks & Notes"
              isActive={archive.activeTab === 'bookmarks'}
              onClick={() => archive.setActiveTab('bookmarks')}
            />
          )}
          {hasAttachments(archive.type) && (
            <DockItem
              badge={availableAttachmentsCount > 0 && availableAttachmentsCount}
              className="right-dock__tab"
              icon="attach-variant"
              data-cy="archived-meetings-sidebar-attachments-tab"
              label="Lecture Notes"
              isActive={archive.activeTab === 'attachments'}
              onClick={() => archive.setActiveTab('attachments')}
            />
          )}
          {newNoticeBoardEnabled && (
            <DockItem
              badge={null}
              className="right-dock__tab"
              icon={
                archive.activeTab === MEETING_TABS.noticeBoard
                  ? 'noticeboard-filled' : 'noticeboard'
              }
              label="Notice Board"
              data-cy="meetings-sidebar-notice-board-tab"
              isActive={archive.activeTab === MEETING_TABS.noticeBoard}
              onClick={handleNoticeBoardTabClick}
            />
          )}
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'attachmentStore')(RightDock);
