import React, { useCallback, useState } from 'react';

import { canCreateBookmarks } from '~meetings/utils/meeting';
import { DockItem } from '~meetings/ui/general';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import {
  DRONA_TROUBLESHOOTING_GUIDE_URL,
  DRONA_TROUBLESHOOTING_PDF_URL,
  MEETING_TABS,
} from '~meetings/utils/constants';
import { EndCall } from '~meetings/ui/actions';
import { mobxify } from '~meetings/ui/hoc';
import { Nudge } from '@common/ui/general';
import { ONE_DAY } from '@common/utils/date';
import { ReactionNotification } from '~meetings/ui/chat';
import { TabPluginsButtonRenderer } from '~meetings/plugins/components';
import { useMediaQuery } from '@common/hooks';

import ActiveParticipantCount from './ActiveParticipantCount';
import analytics from '@common/utils/analytics';
import DoubtSession from './DoubtSession';
import HelpNudgeContent from './HelpNudgeContent';


const getGTMEventProps = (element) => ({
  gtmEventType: 'right_menu',
  gtmEventResult: element,
  gtmEventAction: 'click',
  gtmEventCategory: 'drona',
});

function RightDock({ meetingStore: store, pluginsStore }) {
  const { meeting } = store;
  const [
    externalLinksBadge, setExternalLinksBadge,
  ] = useState(meeting.hasExternalLinks);
  const { messaging, noticeBoard } = meeting;
  const { mobile } = useMediaQuery();
  const newNoticeBoardEnabled = meeting.config?.newNoticeBoardEnabled;

  const openDronaTroubleShootingTips = useCallback(() => {
    window.open(DRONA_TROUBLESHOOTING_PDF_URL, '_blank');
    meeting.track('drona-troubleshooting-tips-clicked');
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaHelpButtonClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_text: 'Help',
      click_feature: DRONA_FEATURES.troubleshooting,
    });
  }, [meeting]);

  const openTroubleshootingGuide = useCallback(() => {
    window.open(DRONA_TROUBLESHOOTING_GUIDE_URL, '_blank');
    meeting.track('drona-troubleshooting-guide-clicked');
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaHelpButtonClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_text: 'Fix Issues',
      click_feature: DRONA_FEATURES.troubleshooting,
    });
  }, [meeting]);

  const handleResourcesClick = useCallback(() => {
    setExternalLinksBadge(false);
    meeting.setActiveTab(MEETING_TABS.externalLinks);
  }, [meeting]);

  const handleChatTabClick = useCallback(() => {
    meeting.setActiveTab(MEETING_TABS.chat);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaOpenChatClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_feature: DRONA_FEATURES.chat,
      custom: {
        is_live: true,
      },
    });
  }, [meeting]);

  const handleNoticeBoardTabClick = useCallback(() => {
    meeting.setActiveTab(MEETING_TABS.noticeBoard);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaOpenNoticeBoardClick,
      click_source: DRONA_SOURCES.meetingRightSideDock,
      click_feature: DRONA_FEATURES.noticeBoard,
      custom: {
        is_live: true,
      },
    });
  }, [meeting]);

  if (!mobile) {
    return (
      <>
        <div className="right-dock scroll">
          <div className="right-dock__tabs">
            {meeting.showParticipantList && (
              <DockItem
                badge={<ActiveParticipantCount />}
                className="right-dock__tab"
                icon="group"
                label="People"
                data-cy="meetings-sidebar-people-tab"
                isActive={meeting.activeTab === MEETING_TABS.people}
                onClick={() => meeting.setActiveTab(MEETING_TABS.people)}
                {...getGTMEventProps(MEETING_TABS.people)}
              />
            )}
            <DockItem
              badge={(
                messaging
                && messaging.unreadMessageCount > 0
                && meeting.activeTab !== MEETING_TABS.chat
                && messaging.unreadMessageCount
              )}
              badgeProps={{ type: 'alert' }}
              className="right-dock__tab"
              data-cy="meetings-sidebar-chat-tab"
              icon="chat"
              label="Chat"
              isActive={meeting.activeTab === MEETING_TABS.chat}
              onClick={handleChatTabClick}
              {...getGTMEventProps(MEETING_TABS.chat)}
            />
            <DockItem
              badge={
                meeting.numActiveQuestions > 0
                && meeting.numActiveQuestions
              }
              badgeProps={{ type: 'alert' }}
              className="right-dock__tab"
              data-cy="meetings-sidebar-questions-tab"
              icon="question"
              label="Questions"
              isActive={meeting.activeTab === MEETING_TABS.questions}
              onClick={() => meeting.setActiveTab(MEETING_TABS.questions)}
              {...getGTMEventProps(MEETING_TABS.questions)}
            />
            {meeting.hasNotes && (
              <DockItem
                className="right-dock__tab"
                icon="pencil"
                label="Notes"
                isActive={meeting.activeTab === MEETING_TABS.notes}
                onClick={() => meeting.setActiveTab(MEETING_TABS.notes)}
                {...getGTMEventProps(MEETING_TABS.notes)}
              />
            )}
            {!meeting.isSuperHost && canCreateBookmarks(meeting.type) && (
              <DockItem
                badge={meeting.hasBookmarks && meeting.numBookmarks}
                className="right-dock__tab"
                icon="bookmark"
                label="Bookmarks & Notes"
                data-cy="meetings-sidebar-bookmark-tab"
                isActive={meeting.activeTab === MEETING_TABS.bookmarks}
                onClick={() => meeting.setActiveTab(MEETING_TABS.bookmarks)}
                {...getGTMEventProps(MEETING_TABS.bookmarks)}
              />
            )}
            {newNoticeBoardEnabled && (
              <DockItem
                badge={
                  noticeBoard.unreadMessageCount > 0
                    && noticeBoard.unreadMessageCount
                }
                className="right-dock__tab"
                icon={
                  meeting.activeTab === MEETING_TABS.noticeBoard
                    ? 'noticeboard-filled' : 'noticeboard'
                }
                label="Notice Board"
                data-cy="meetings-sidebar-notice-board-tab"
                isActive={meeting.activeTab === MEETING_TABS.noticeBoard}
                onClick={handleNoticeBoardTabClick}
                {...getGTMEventProps(MEETING_TABS.noticeBoard)}
              />
            )}
            {meeting.hasExternalLinks && (
              <DockItem
                badge={externalLinksBadge}
                badgeProps={{ small: true, type: 'alert' }}
                className="right-dock__tab"
                icon="curriculum"
                label="Resources"
                isActive={meeting.activeTab === MEETING_TABS.externalLinks}
                onClick={handleResourcesClick}
                {...getGTMEventProps(MEETING_TABS.externalLinks)}
              />
            )}
            <Nudge
              component={DockItem}
              content={<HelpNudgeContent />}
              numCloses={Number.MAX_SAFE_INTEGER}
              placement="left"
              name="m-right-dock-help-nudge"
              isActive={meeting.needsTroubleshootingHelp}
              interval={ONE_DAY}
              className="right-dock__tab"
              icon="info"
              label="Help"
              data-cy="meetings-help-button"
              onClick={openDronaTroubleShootingTips}
              {...getGTMEventProps('help')}
            />
            <DockItem
              className="right-dock__tab"
              icon="circle-help"
              label="Fix Issues"
              data-cy="meetings-fix-issues-button"
              onClick={openTroubleshootingGuide}
              {...getGTMEventProps('fix-issues')}
            />
            <TabPluginsButtonRenderer plugins={pluginsStore.tabPlugins} />
          </div>
          <div className="right-dock__tabs">
            <DoubtSession />
            <div className="row flex-c m-v-10">
              <EndCall />
            </div>
          </div>
        </div>
        {meeting.isReactionNotificationEnabled && <ReactionNotification />}
      </>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'pluginsStore')(RightDock);
