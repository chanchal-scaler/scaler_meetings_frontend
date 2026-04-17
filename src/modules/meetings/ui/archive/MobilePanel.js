import React, { useCallback } from 'react';

import { ArchiveBookmarks } from '~meetings/ui/bookmarks';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { mobxify } from '~meetings/ui/hoc';
import { hasAttachments } from '~meetings/utils/attachments';
import { SegmentedControl, SegmentedControlOption } from '@common/ui/general';
import { useMediaQuery } from '@common/hooks';
import analytics from '@common/utils/analytics';
import Attachments from './Attachments';
import Chat from './Chat';
import NoticeBoard from '~meetings/ui/notice_board';

function MobilePanel({ meetingStore: store }) {
  const { tablet } = useMediaQuery();
  const { archive } = store;

  const newNoticeBoardEnabled = archive.config?.newNoticeBoardEnabled;

  const handleChatTabClick = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaOpenChatClick,
      click_source: DRONA_SOURCES.meetingMobileView,
      click_feature: DRONA_FEATURES.chat,
      custom: {
        is_live: false,
      },
    });
  }, []);

  const handleNoticeBoardClick = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaOpenNoticeBoardClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_feature: DRONA_FEATURES.noticeBoard,
      custom: {
        is_live: false,
        from_mobile: true,
      },
    });
  }, []);

  function headerUi() {
    return (
      <div className="layout__header archive-panel__header">
        <SegmentedControl
          className="meeting-tabbar"
          onChange={archive.setActiveTab}
          value={archive.activeTab}
        >
          <SegmentedControlOption
            className="meeting-tabbar__title"
            name="chat"
            onClick={handleChatTabClick}
          >
            Chat
          </SegmentedControlOption>
          <SegmentedControlOption
            className="meeting-tabbar__title"
            name="bookmarks"
          >
            Bookmarks
          </SegmentedControlOption>
          {hasAttachments(archive.type) && (
            <SegmentedControlOption
              className="meeting-tabbar__title"
              name="attachments"
            >
              Attachments
            </SegmentedControlOption>
          )}
          {newNoticeBoardEnabled && (
            <SegmentedControlOption
              className="meeting-tabbar__title"
              name="notice_board"
              onClick={handleNoticeBoardClick}
            >
              Pinned
            </SegmentedControlOption>
          )}
        </SegmentedControl>
      </div>
    );
  }

  function tabsUi() {
    switch (archive.activeTab) {
      case 'chat':
        return <Chat />;
      case 'attachments':
        return <Attachments />;
      case 'notice_board':
        return <NoticeBoard />;
      default:
        return <ArchiveBookmarks />;
    }
  }

  if (tablet) {
    return (
      <div className="layout archive-panel">
        {headerUi()}
        {tabsUi()}
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(MobilePanel);
