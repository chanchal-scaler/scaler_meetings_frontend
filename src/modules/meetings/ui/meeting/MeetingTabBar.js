import React, { useEffect } from 'react';
import classNames from 'classnames';

import {
  Badge,
  Icon,
  SegmentedControl,
  SegmentedControlOption,
} from '@common/ui/general';
import { canCreateBookmarks } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { TabPluginsButtonRenderer } from '~meetings/plugins/components';
import ActiveParticipantCount from './ActiveParticipantCount';
import { MEETING_TABS } from '~meetings/utils/constants';

function MeetingTabBar({ meetingStore: store, pluginsStore }) {
  const { meeting } = store;
  const { activeTab, messaging, noticeBoard } = meeting;
  const newNoticeBoardEnabled = meeting.config?.newNoticeBoardEnabled;

  useEffect(() => {
    if (!activeTab) {
      meeting.setActiveTab(MEETING_TABS.chat);
    }
  }, [activeTab, meeting]);

  return (
    <SegmentedControl
      className="meeting-tabbar"
      onChange={meeting.setActiveTab}
      value={activeTab}
    >
      {meeting.showParticipantList && (
        <SegmentedControlOption
          className="meeting-tabbar__title badge-container"
          name="people"
        >
          <div className="meeting-tabbar__icon">
            <Icon name="group" />
          </div>
          <div
            className={classNames(
              'meeting-tabbar__label',
              { 'meeting-tabbar__label--expanded': activeTab === 'people' },
            )}
          >
            People
          </div>
          <Badge
            className="meeting-tabbar__badge"
            position={{ top: '-0.5rem', right: '0.5rem' }}
            small
            type="default"
          >
            <ActiveParticipantCount />
          </Badge>
        </SegmentedControlOption>
      )}
      <SegmentedControlOption
        className="meeting-tabbar__title badge-container"
        name="chat"
      >
        <div className="meeting-tabbar__icon">
          <Icon name="chat" />
        </div>
        <div
          className={classNames(
            'meeting-tabbar__label',
            { 'meeting-tabbar__label--expanded': activeTab === 'chat' },
          )}
        >
          Chat
        </div>
        {
          messaging
          && messaging.unreadMessageCount > 0
          && meeting.activeTab !== 'chat'
          && (
            <Badge
              position={{ top: '-0.5rem', right: '0.5rem' }}
              small
            >
              {messaging.unreadMessageCount}
            </Badge>
          )
        }
      </SegmentedControlOption>
      <SegmentedControlOption
        className="meeting-tabbar__title badge-container"
        name="questions"
      >
        <div className="meeting-tabbar__icon">
          <Icon name="question" />
        </div>
        <div
          className={classNames(
            'meeting-tabbar__label',
            { 'meeting-tabbar__label--expanded': activeTab === 'questions' },
          )}
        >
          Questions
        </div>
        {meeting.numActiveQuestions > 0 && (
          <Badge
            position={{ top: '-0.5rem', right: '0.5rem' }}
            small
          >
            {meeting.numActiveQuestions}
          </Badge>
        )}
      </SegmentedControlOption>
      {newNoticeBoardEnabled && (
        <SegmentedControlOption
          className="meeting-tabbar__title badge-container"
          name={MEETING_TABS.noticeBoard}
        >
          <div className="meeting-tabbar__icon">
            <Icon name={activeTab === 'notice_board'
              ? 'noticeboard-filled' : 'noticeboard'}
            />
          </div>
          <div
            className={classNames(
              'meeting-tabbar__label',
              {
                'meeting-tabbar__label--expanded': activeTab === 'noticeboard',
              },
            )}
          >
            Pin
          </div>
          {noticeBoard.unreadMessageCount > 0 && (
            <Badge
              position={{ top: '-0.5rem', right: '0.5rem' }}
              small
            >
              {noticeBoard.unreadMessageCount}
            </Badge>
          )}
        </SegmentedControlOption>
      )}
      {!meeting.isSuperHost && canCreateBookmarks(meeting.type) && (
        <SegmentedControlOption
          className="meeting-tabbar__title badge-container"
          name="bookmarks"
        >
          <div className="meeting-tabbar__icon">
            <Icon name="bookmark" />
          </div>
          <div
            className={classNames(
              'meeting-tabbar__label',
              { 'meeting-tabbar__label--expanded': activeTab === 'bookmarks' },
            )}
          >
            Bookmarks
          </div>
          {meeting.hasBookmarks > 0 && (
            <Badge
              className="meeting-tabbar__badge"
              position={{ top: '-0.5rem', right: '0.5rem' }}
              small
              type="default"
            >
              {meeting.numBookmarks}
            </Badge>
          )}
        </SegmentedControlOption>
      )}
      {meeting.hasNotes && (
        <SegmentedControlOption
          className="meeting-tabbar__title badge-container"
          name="notes"
        >
          <div className="meeting-tabbar__icon">
            <Icon name="pencil" />
          </div>
          <div
            className={classNames(
              'meeting-tabbar__label',
              { 'meeting-tabbar__label--expanded': activeTab === 'notes' },
            )}
          >
            Notes
          </div>
        </SegmentedControlOption>
      )}
      <TabPluginsButtonRenderer plugins={pluginsStore.tabPlugins} />
    </SegmentedControl>
  );
}

export default mobxify('meetingStore', 'pluginsStore')(MeetingTabBar);
