import React, { useCallback } from 'react';
import classNames from 'classnames';

import { AudioIndicator } from '~meetings/ui/media';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { useAudioVideoTracking } from '~meetings/hooks';
import analytics from '@common/utils/analytics';

function MuteAudio({
  meetingStore: store,
  className,
  mediaStore,
  settingsStore,
}) {
  const { meeting } = store;
  const { videoBroadcasting } = meeting;
  const { hasAudioHardwareError, audioHardwareError } = mediaStore;

  useAudioVideoTracking({
    meeting,
    type: 'audio-tracking',
    isMuted: (
      videoBroadcasting
      && videoBroadcasting.avStream
      && videoBroadcasting.avStream.isAudioMuted
    ),
  });

  const navigateToAudioSettings = useCallback(() => {
    settingsStore.setSettingsModalOpen(true);
    settingsStore.setActiveTab('audio');
  }, [settingsStore]);

  const handleUpdateMicrophoneState = useCallback((state) => {
    meeting.videoBroadcasting.setMute('audio', state, 'userAction');
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaAudioToggleClick,
      click_feature: DRONA_FEATURES.meetingSettings,
      click_source: DRONA_SOURCES.meetingBottomPanel,
      custom: {
        audio_state: !state,
      },
    });
  }, [meeting]);

  if (hasAudioHardwareError) {
    return (
      <IconButton
        label={(
          audioHardwareError.message
          || 'Unable to load your microphone'
        )}
        className="av-preview__action av-preview__action--audio btn-light"
        icon="mic-off"
        type="danger"
        data-cy="meetings-mic-error-button"
        onClick={navigateToAudioSettings}
      />
    );
  } else if (!videoBroadcasting || !videoBroadcasting.avStream) {
    return (
      <IconButton
        className={classNames(
          'btn-disabled',
          { [className]: className },
        )}
        icon="mic-off"
        data-cy="meetings-mic-disabled-button"
        label="Audience cannot use this feature"
      />
    );
  } else if (videoBroadcasting.avStream.isAudioMuted) {
    return (
      <IconButton
        className={className}
        icon="mic-off"
        label="Click to unmute"
        onClick={() => handleUpdateMicrophoneState(false)}
        data-cy="meetings-unmute-audio-button"
        type="danger"
      />
    );
  } else {
    return (
      <AudioIndicator
        stream={videoBroadcasting.micStream}
        className={className}
        label="Click to mute"
        data-cy="meetings-audio-indicator"
        onClick={() => handleUpdateMicrophoneState(true)}
      />
    );
  }
}

export default mobxify(
  'meetingStore', 'mediaStore', 'settingsStore',
)(MuteAudio);
