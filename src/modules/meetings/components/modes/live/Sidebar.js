import React, { useCallback } from 'react';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Icon, Tappable } from '@common/ui/general';
import {
  MeetingTabs,
  RightDock,
  VideoParticipantsMini,
} from '~meetings/ui/meeting';
import { MEETING_TABS } from '~meetings/utils/constants';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaQuery } from '@common/hooks';
import analytics from '@common/utils/analytics';
import SidebarContainer from '~meetings/ui/SidebarContainer';

const tabsLabelMap = {
  [MEETING_TABS.chat]: 'Chat',
  [MEETING_TABS.notes]: 'Notes',
  [MEETING_TABS.people]: 'People',
  [MEETING_TABS.questions]: 'Questions',
  [MEETING_TABS.bookmarks]: 'Bookmarks',
  [MEETING_TABS.playlist]: 'Videos for this session',
  [MEETING_TABS.noticeBoard]: 'Notice Board',
  [MEETING_TABS.externalLinks]: 'Resources for you',
};

const iconsMap = {
  [MEETING_TABS.externalLinks]: 'curriculum',
};


// Currently we are exposing whole sidebar. Tabs cannot be customised
// If needed then we can split down this into smaller components and export
// from here
function Sidebar({ meetingStore: store, pluginsStore }) {
  const { meeting } = store;
  const { mobile } = useMediaQuery();

  const handleChatClose = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaCloseChatClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_feature: DRONA_FEATURES.chat,
    });
    meeting.setActiveTab(null);
  }, [meeting]);

  function closeUi() {
    return (
      <Tappable
        className="btn btn-icon btn-round m-sidebar__close"
        gtmEventType="right_menu_close"
        gtmEventResult={meeting.activeTab}
        gtmEventAction="click"
        gtmEventCategory="drona"
        onClick={handleChatClose}
      >
        <Icon name="clear" />
      </Tappable>
    );
  }

  function headerUi() {
    return (
      <div className="m-sidebar__header">
        <div className="m-sidebar__options">
          {!!iconsMap[meeting.activeTab] && (
            <Icon
              name={iconsMap[meeting.activeTab]}
              className="m-r-5 m-sidebar__icon"
            />
          )}
          <div className="h3 bold dark full-width">
            {
              tabsLabelMap[meeting.activeTab]
              || pluginsStore.tabsLabelMap[meeting.activeTab]
            }
          </div>
        </div>
        {closeUi()}
      </div>
    );
  }

  if (!mobile) {
    return (
      <div className="meeting-sidebar" id="meeting-sidebar">
        <SidebarContainer
          isOpen={Boolean(meeting.activeTab)}
        >
          <VideoParticipantsMini />
          {headerUi()}
          <MeetingTabs />
        </SidebarContainer>
        <RightDock />
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'pluginsStore')(Sidebar);
