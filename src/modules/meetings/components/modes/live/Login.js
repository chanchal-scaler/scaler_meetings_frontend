import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

import { AVPreview } from '~meetings/ui/media';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { meetingTypeLabel } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { RenderIfLayoutMatch } from '~meetings/ui/layout';
import {
  Icon,
  SegmentedControl,
  SegmentedControlOption,
  Tappable,
  Tooltip,
} from '@common/ui/general';
import { useMediaQuery } from '@common/hooks';
import { VIEW_TYPES } from '@vectord/analytics';
import analytics from '@common/utils/analytics';
import CheckAV from './CheckAV';
import Checklist from '~meetings/ui/Checklist';
import CompanionModeJoin from '~meetings/images/companion-mode-join.svg';
import CompanionModeJoinDark from
  '~meetings/images/companion-mode-join-dark.svg';
import OnboardingSetup from './OnboardingSetup';

const roleLabelMap = {
  audience: 'Audience',
  host: 'Host',
};

function parseError(error) {
  let message = 'Something went wrong! Please reload page and try again!';

  if (error && error.response) {
    switch (error.response.status) {
      case 409:
        message = 'Meeting has ended';
        break;
      case 403:
        message = 'Incorrect password';
        break;
      case 404:
        message = 'Meeting not found';
        break;
      default:
      // Do nothing
    }
  }

  return message;
}

function Login({ meetingStore: store, mediaStore }) {
  const { meeting } = store;
  const { tablet } = useMediaQuery();
  const { hasAudioHardwareError, hasVideoHardwareError } = mediaStore;

  const [mode, setMode] = useState('normal');

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    // eslint-disable-next-line no-console
    console.log('[meetings:login:submit]', {
      slug: meeting.slug,
      selectedRole: meeting.selectedRole,
      mode,
      canLogin: meeting.canLogin,
      isLoggingIn: meeting.isLoggingIn,
    });
    analytics.setSuperAttributes({
      ...analytics.superAttributes,
      joined_as: meeting.selectedRole,
    });
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaMeetingJoinClick,
      click_feature: DRONA_FEATURES.meetingJoinFlow,
      click_source: DRONA_SOURCES.meetingPreJoinModal,
      custom: { mode },
    });
    meeting.login(mode).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Login failed:', error);
    });
  }, [meeting, mode]);

  const handleRequestPermissions = useCallback(() => {
    mediaStore.setEnabledHardware({ video: true, audio: true });
    mediaStore.requestPermissions();
  }, [mediaStore]);

  const handleSwitchRole = useCallback((role) => {
    meeting.setSelectedRole(role);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaMeetingJoinAsClick,
      click_feature: DRONA_FEATURES.meetingJoinFlow,
      click_source: DRONA_SOURCES.meetingPreJoinModal,
      click_text: role,
    });
  }, [meeting]);

  useEffect(() => {
    analytics.view({
      view_name: DRONA_TRACKING_TYPES.dronaPreMeetingJoinView,
      view_type: VIEW_TYPES.dashboard,
    });
  });

  useEffect(() => {
    /**
     * Only show onboarding screens to hosts and super hosts
     */
    if (meeting.isHost) {
      mediaStore.checkOnboardingRequired();
    }
  }, [mediaStore, meeting.isHost]);

  useEffect(() => {
    if (hasVideoHardwareError) {
      meeting.setJoinMode('video', false);
    } else {
      meeting.setJoinMode('video', true);
    }
  }, [hasVideoHardwareError, meeting, store]);

  useEffect(() => {
    if (hasAudioHardwareError) {
      meeting.setJoinMode('audio', false);
    } else {
      meeting.setJoinMode('audio', true);
    }
  }, [hasAudioHardwareError, meeting, store]);

  const navigateToOnboarding = useCallback(() => {
    mediaStore.setOnboardingRequired(true, { replaceLS: false });
  }, [mediaStore]);

  function errorUi() {
    if (meeting.loginError) {
      return (
        <p className="danger m-v-10">
          {parseError(meeting.loginError)}
        </p>
      );
    } else {
      return null;
    }
  }

  function roleItemUi(role) {
    return (
      <SegmentedControlOption
        key={role}
        name={role}
        gtmEventType="tab"
        gtmEventAction="click"
        gtmEventResult={roleLabelMap[role]}
        gtmEventCategory="drona"
        className="m-login__role-segmented-control-option"
        data-cy="meeting-role-option"
        activeClassName="m-login__role-segmented-control-option--active"
      >
        {roleLabelMap[role]}
      </SegmentedControlOption>
    );
  }

  function roleUi() {
    if (meeting.allowedRoles.length > 1) {
      return (
        <>
          <div className="m-login__role">
            <div className="m-login__role-label">
              Join as
            </div>
            <SegmentedControl
              className="full-width m-login__role-segmented-control"
              onChange={handleSwitchRole}
              value={meeting.selectedRole}
            >
              {meeting.allowedRoles.map(roleItemUi)}
            </SegmentedControl>
          </div>
          <div className="m-t-10 text-c h5">
            Audience allows you only to
            {' '}
            <span className="dark bold">listen</span>
            {' '}
            the Host and
            {' '}
            <span className="dark bold">Raise hand</span>
            {' '}
            if you have a doubt
          </div>
        </>
      );
    } else {
      return null;
    }
  }

  function recordingUi() {
    return meeting.data.show_recording_info
      ? (
        <div className="m-login__recording m-t-10 h5">
          <Icon name="camera" className="m-login__recording-icon" />
          <div className="m-l-5">
            This meeting will be recorded.
            Recording will accessible by the
            members of the call.
          </div>
        </div>
      ) : null;
  }

  function infoUi() {
    if (meeting.allowedRoles.length <= 1) {
      return (
        <div className="m-login__info">
          <div className="bold dark m-t-10 m-b-5">
            {meeting.name}
            {' '}
            (
            {meetingTypeLabel(meeting.type)}
            )
          </div>
          <div className="m-login__user m-b-20">
            You are joining as
            {' '}
            <span className="dark">
              {meeting.user.email}
            </span>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  function previewUi() {
    if (meeting.selectedRole === 'host' || mediaStore.onboardingRequired) {
      return <AVPreview />;
    } else {
      return null;
    }
  }
  function passwordUi() {
    if (
      meeting.selectedRole === 'audience'
      && meeting.isAudiencePasswordNeeded
    ) {
      return (
        <input
          data-cy="meetings-audience-password-input"
          type="text"
          placeholder="Audience Password"
          onChange={(event) => meeting.setPassword(event.target.value)}
          value={meeting.password}
          className="m-login__password"
        />
      );
    } else if (
      meeting.selectedRole === 'host'
      && meeting.isHostPasswordNeeded
      && meeting.canLogin
    ) {
      return (
        <input
          type="text"
          placeholder="Host Password"
          onChange={(event) => meeting.setPassword(event.target.value)}
          value={meeting.password}
          className="m-login__password"
        />
      );
    } else {
      return null;
    }
  }

  function joinUi() {
    if (meeting.isCompanionModeForced) {
      return (
        <Tappable
          className="btn btn-success bold m-login__submit
            m-login__companion"
          data-cy="meetings-join-button"
          disabled={meeting.isLoggingIn}
          gtmEventType="join_companion_forced"
          gtmEventAction="click"
          gtmEventCategory="drona"
          type="submit"
          component="button"
          onClick={() => setMode('companion')}
        >
          <img
            src={CompanionModeJoin}
            alt="Companion Mode"
          />
          Use Companion Mode
        </Tappable>
      );
    } else if (meeting.canLogin) {
      return (
        <>
          <Tappable
            className="btn btn-success bold m-login__submit"
            data-cy="meetings-join-button"
            disabled={meeting.isLoggingIn}
            gtmEventType="join"
            gtmEventAction="click"
            gtmEventCategory="drona"
            type="submit"
            component="button"
          >
            JOIN
          </Tappable>
          {meeting.isCompanionModeAllowed && (
            <Tappable
              className="btn btn-success bold m-login__submit
                m-login__companion m-login__companion--dark"
              data-cy="meetings-join-button"
              disabled={meeting.isLoggingIn}
              gtmEventType="join_companion_manual"
              gtmEventAction="click"
              gtmEventCategory="drona"
              type="submit"
              component="button"
              onClick={() => setMode('companion')}
            >
              <img
                src={CompanionModeJoinDark}
                alt="Companion Mode"
              />
              Use Companion Mode
            </Tappable>
          )}
        </>
      );
    } else if (!mediaStore.hasPermissions) {
      return (
        <Tooltip
          className="m-login__submit"
          popoverProps={{
            placement: 'top',
            margin: { top: -10 },
          }}
          /**
           * checks audio and video permissions for required roles,
           * - Has only Audio -> allowed to join class
           * - Has only Video -> not allowed to join class
           * - AudioVideo denied -> not allowed to join class
           * - AudioVideo enabled -> allowed to join class
           */
          title="
            You need to allow microphone/camera access to join this meeting
          "
        >
          <Tappable
            className="btn btn-danger bold full-width"
            onClick={handleRequestPermissions}
          >
            PLEASE GRANT MICROPHONE/CAMERA PERMISSIONS
          </Tappable>
        </Tooltip>
      );
    } else if (!mediaStore.hasMinimumHostAVRequirements) {
      return (
        <Tooltip
          className="m-login__submit"
          popoverProps={{
            placement: 'top',
            margin: { top: -10 },
          }}
          title={
            `Please select a microphone to join the meeting
            ${meeting.allowedRoles.length > 1 && ' or join as an audience'}`
          }
        >
          <Tappable
            className="btn btn-danger bold full-width"
            onClick={navigateToOnboarding}
          >
            SELECT A MICROPHONE TO JOIN
          </Tappable>
        </Tooltip>
      );
    } else if (mediaStore.enabledAVStreamsLoading) {
      return (
        <Tooltip
          className="m-login__submit"
          popoverProps={{
            placement: 'top',
            margin: { top: -10 },
          }}
          title="Please wait while camera/microphone is being started"
        >
          <Tappable
            className="btn btn-success bold full-width"
            disabled
          >
            JOIN
          </Tappable>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip
          className="m-login__submit"
          popoverProps={{
            placement: 'top',
            margin: { top: -10 },
          }}
          title="Unable to join meeting, please contact support"
        >
          <Tappable
            className="btn btn-danger bold full-width"
            disabled
          >
            JOIN
          </Tappable>
        </Tooltip>
      );
    }
  }

  function submitUi() {
    return (
      <div className="row m-login__footer">
        {passwordUi()}
        {joinUi()}
      </div>

    );
  }

  function welcomeUi() {
    return (
      <h3 className={classNames(
        'm-login__welcome',
        { 'm-login__welcome--host': meeting.selectedRole === 'host' },
        { 'm-login__welcome--audience': meeting.selectedRole === 'audience' },
      )}
      >
        Welcome
        {' '}
        {meeting.user.name}
      </h3>
    );
  }

  const handleClickCheckAV = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaSystemCheckClick,
      click_feature: DRONA_FEATURES.meetingJoinFlow,
      click_source: DRONA_SOURCES.meetingPreJoinModal,
    });
    navigateToOnboarding();
  }, [navigateToOnboarding]);

  function navigateToOnboardingFlowUi() {
    if (!tablet && meeting.selectedRole === 'host') {
      return <CheckAV onClick={handleClickCheckAV} />;
    } else {
      return null;
    }
  }

  function broadcastModeUi() {
    if (mediaStore.onboardingRequired) {
      return <OnboardingSetup />;
    } else {
      return (
        <>
          {roleUi()}
          {navigateToOnboardingFlowUi()}
          <RenderIfLayoutMatch>
            <div className="m-login__checklist-container">
              <Checklist variant="light" />
            </div>
          </RenderIfLayoutMatch>
          {infoUi()}
          {errorUi()}
          {submitUi()}
          {recordingUi()}
        </>
      );
    }
  }

  function formUi() {
    return (
      <form
        className="form m-login__form"
        onSubmit={handleSubmit}
      >
        {previewUi()}
        <div className="m-login__container">
          {welcomeUi()}
          {broadcastModeUi()}
        </div>
      </form>
    );
  }

  return (
    <div className="m-login">
      <div className="card card--large m-login__card">
        {formUi()}
      </div>
    </div>
  );
}

export default mobxify('layoutStore', 'meetingStore', 'mediaStore')(Login);
