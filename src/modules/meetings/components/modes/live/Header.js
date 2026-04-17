import React, { useCallback } from 'react';
import classNames from 'classnames';

import { CountDown, Icon, Tooltip } from '@common/ui/general';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import {
  canCreateBookmarks,
  canCreatePollAndQuiz,
  meetingTypeLabel,
  canCreateSurvey,
} from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { SettingsToggle, TogglePlayback } from '~meetings/ui/actions';
import { useMediaQuery } from '@common/hooks';
import {
  LiveParticipants,
  MeetingStartCountdown,
  RecordingStatus,
} from '~meetings/ui/meeting';
import { VIEW_TYPES } from '@vectord/analytics';
import analytics from '@common/utils/analytics';
import CustomHeaderActions from '~meetings/ui/CustomHeaderActions';
import logo from '@common/images/svg/sr-logo-light.svg';
import NetworkIndicator from '~meetings/ui/NetworkIndicator';
import PlatformFeedback from './PlatformFeedback';
import ProxyMessage from './ProxyMessage';
import ProxyQuestion from './ProxyQuestion';

function Header({
  meetingStore: store, quizStore, pollStore, surveyStore,
  leftActions, rightActions,
}) {
  const { mobile } = useMediaQuery();
  const { meeting } = store;
  const { manager, videoBroadcasting } = meeting;
  const isCollapsed = videoBroadcasting && videoBroadcasting.hasPinnedStream;
  const isLeaderboardOpen = manager && manager.isLeaderboardOpen;
  const pollAndQuizEnabled = canCreatePollAndQuiz(meeting.type);
  const surveyEnabled = canCreateSurvey(meeting.type);

  const handleStatsToggle = useCallback(() => {
    const { isStatsEnabled } = videoBroadcasting;
    videoBroadcasting.setStatsEnabled(!isStatsEnabled);
  }, [videoBroadcasting]);

  const handleLeaderboardToggle = useCallback(() => {
    analytics.view({
      view_name: DRONA_TRACKING_TYPES.dronaViewLeaderboardClick,
      view_type: VIEW_TYPES.modal,
      view_feature: DRONA_FEATURES.leaderboard,
      view_source: DRONA_SOURCES.meetingTopNavBar,
    });
    if (!isLeaderboardOpen) {
      manager.fetchLeaderboard();
    }
    manager.setLeaderboardOpen(!isLeaderboardOpen);
  }, [isLeaderboardOpen, manager]);

  const handleBookmarkOpen = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaBookmarkTabClick,
      click_source: DRONA_SOURCES.meetingTopNavBar,
      click_feature: DRONA_FEATURES.bookmark,
    });
    meeting.setBookmarkModalOpen(true);
  }, [meeting]);

  const handleLaunchQuiz = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaLaunchQuizButtonClick,
      click_source: DRONA_SOURCES.meetingTopNavBar,
      click_feature: DRONA_FEATURES.quiz,
    });
    quizStore.setHQOpen(true);
  }, [quizStore]);

  const handleLaunchPoll = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaLaunchPollButtonClick,
      click_source: DRONA_SOURCES.meetingTopNavBar,
      click_feature: DRONA_FEATURES.poll,
    });
    pollStore.setHQOpen(true);
  }, [pollStore]);

  function nerdStatsUi() {
    if (meeting.isAdmin && meeting.isGodMode && videoBroadcasting) {
      return (
        <IconButton
          className="m-header__action"
          icon="screen"
          label="Stats for nerds"
          onClick={handleStatsToggle}
        />
      );
    } else {
      return null;
    }
  }

  function recordingUi() {
    if (mobile && meeting.recording) {
      return (
        <RecordingStatus
          className="m-header__action"
          variant="compact"
        />
      );
    } else {
      return null;
    }
  }

  function networkUi() {
    return <NetworkIndicator className="m-header__action" />;
  }

  function bookmarkUi() {
    if (
      !mobile
      && meeting.isSuperHost
      && meeting.recording
      && meeting.recording.isActive
      && canCreateBookmarks(meeting.type)
    ) {
      return (
        <IconButton
          className="m-header__action"
          icon="bookmark"
          label="Bookmark this point"
          data-cy="meetings-bookmark-button"
          popoverProps={{
            placement: 'left',
          }}
          onClick={handleBookmarkOpen}
        />
      );
    } else {
      return null;
    }
  }

  function leaderboardUi() {
    if (
      manager
      && manager.isConnected
      && pollAndQuizEnabled
    ) {
      return (
        <IconButton
          className="m-header__action"
          icon="trophy"
          label="View leaderboard"
          popoverProps={{
            placement: 'bottom',
          }}
          data-cy="meetings-leaderboard-button"
          gtmEventType="leaderboard_action"
          gtmEventAction="click"
          gtmEventResult={isLeaderboardOpen
            ? 'close_leaderboard' : 'open_leaderboard'}
          gtmEventCategory="drona"
          onClick={handleLeaderboardToggle}
        />
      );
    } else {
      return null;
    }
  }

  function quizUi() {
    if (
      !mobile
      && meeting.isSuperHost
      && quizStore.isLive
      && pollAndQuizEnabled
    ) {
      return (
        <IconButton
          className="m-header__action"
          icon="thunder"
          label="Launch a quiz"
          data-cy="meeting-quiz-modal-button"
          popoverProps={{
            placement: 'bottom',
          }}
          onClick={handleLaunchQuiz}
        />
      );
    } else {
      return null;
    }
  }

  function pollUi() {
    if (
      !mobile
      && meeting.isSuperHost
      && pollStore.isLive
      && pollAndQuizEnabled
    ) {
      return (
        <IconButton
          className="m-header__action"
          icon="poll"
          data-cy="meeting-polls-modal-button"
          label="Launch a poll"
          popoverProps={{
            placement: 'bottom',
          }}
          onClick={handleLaunchPoll}
        />
      );
    } else {
      return null;
    }
  }
  function surveyUi() {
    if (
      !mobile
      && meeting.isSuperHost
      && surveyStore.isLive
      && surveyEnabled
    ) {
      return (
        <IconButton
          className="m-header__action"
          icon="list"
          label="Launch a survey"
          data-cy="meeting-survey-modal-button"
          popoverProps={{
            placement: 'bottom',
          }}
          onClick={() => surveyStore.setHQOpen(true)}
        />
      );
    } else {
      return null;
    }
  }

  function countdownUi() {
    if (meeting.type === 'timed_interaction') {
      return (
        <Tooltip
          className="
            m-header__action m-btn m-btn--default row flex-ac
            p-10 warning
          "
          title="Meeting will be ended when the timer ends"
        >
          <Icon
            className="m-r-5"
            name="hour-glass"
          />
          <CountDown
            format={CountDown.TIMER_WITHOUT_PAST}
            time={meeting.endTime}
          />
        </Tooltip>
      );
    } else {
      return null;
    }
  }


  return (
    <div
      className={classNames(
        'm-header',
        { 'm-header--collapsed': isCollapsed },
      )}
    >
      {leftActions?.length > 0 ? (
        <div className="m-header__actions m-header__actions--left">
          <CustomHeaderActions
            actions={leftActions}
            mode="live"
          />
        </div>
      ) : (
        <div className="m-header__brand">
          <img
            alt="Scaler"
            src={logo}
          />
        </div>
      )}
      <div className="m-header__title m-header__title--live">
        <span className="m-header__name" data-cy="meeting-header-name">
          {meeting.name}
        </span>
        <span className="hide-in-mobile m-h-5">
          |
        </span>
        <span className="m-header__type" data-cy="meeting-header-type">
          {meetingTypeLabel(meeting.type)}
        </span>
      </div>
      <div className="m-header__actions">
        <ProxyQuestion />
        <ProxyMessage />
        <CustomHeaderActions
          actions={rightActions}
          mode="live"
        />
        {networkUi()}
        {recordingUi()}
        {countdownUi()}
        {store.data.status === 'upcoming' && <MeetingStartCountdown />}
        <LiveParticipants />
        <TogglePlayback className="m-header__action" />
        {bookmarkUi()}
        {surveyUi()}
        <PlatformFeedback />
        {leaderboardUi()}
        {quizUi()}
        {pollUi()}
        {nerdStatsUi()}
        <SettingsToggle
          className="m-header__action"
          source={DRONA_SOURCES.meetingTopNavBar}
        />
      </div>
    </div>
  );
}

export default mobxify(
  'settingsStore', 'meetingStore', 'quizStore', 'pollStore', 'surveyStore',
)(Header);
