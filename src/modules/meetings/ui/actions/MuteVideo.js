import React, { useCallback } from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { useAudioVideoTracking } from '~meetings/hooks';
import analytics from '@common/utils/analytics';

function MuteVideo({
  className,
  mediaStore,
  meetingStore: store,
  settingsStore,
}) {
  const { meeting } = store;
  const { videoBroadcasting } = meeting;
  const { hasVideoHardwareError, videoHardwareError } = store;

  const handleUpdateCameraState = useCallback((state) => {
    meeting.videoBroadcasting.setMute('video', state, 'userAction');
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaVideoToggleClick,
      click_feature: DRONA_FEATURES.meetingSettings,
      click_source: DRONA_SOURCES.meetingBottomPanel,
      custom: {
        video_state: !state,
      },
    });
  }, [meeting]);

  useAudioVideoTracking({
    meeting,
    type: 'video-tracking',
    isMuted: (
      videoBroadcasting
      && videoBroadcasting.avStream
      && videoBroadcasting.avStream.isVideoMuted
    ),
  });

  const navigateToVideoSettings = useCallback(() => {
    settingsStore.setSettingsModalOpen(true);
    settingsStore.setActiveTab('video');
  }, [settingsStore]);

  if (hasVideoHardwareError) {
    return (
      <IconButton
        label={videoHardwareError.message || 'Unable to load your camera'}
        className={classNames(
          'btn-disabled',
          { [className]: className },
        )}
        icon="camera-off"
        data-cy="meetings-camera-error-button"
        onClick={navigateToVideoSettings}
      />
    );
  } else if (!videoBroadcasting || !videoBroadcasting.avStream) {
    return (
      <IconButton
        className={classNames(
          'btn-disabled',
          { [className]: className },
        )}
        icon="camera-off"
        data-cy="meetings-camera-disabled-button"
        label="Audience cannot use this feature"
      />
    );
  } else if (!mediaStore.video) {
    return (
      <IconButton
        className={classNames(
          'btn-disabled',
          { [className]: className },
        )}
        icon="camera-off"
        data-cy="meetings-camera-disabled-button-not-present"
        label="Camera not enabled!"
      />
    );
  } else if (videoBroadcasting.avStream.isVideoMuted) {
    return (
      <IconButton
        className={className}
        icon="camera-off"
        data-cy="meetings-camera-open-button"
        label="Click to turn camera on"
        onClick={() => handleUpdateCameraState(false)}
        type="danger"
      />
    );
  } else {
    return (
      <IconButton
        className={className}
        icon="camera"
        data-cy="meetings-camera-close-button"
        label="Click to turn camera off"
        onClick={() => handleUpdateCameraState(true)}
      />
    );
  }
}

export default mobxify(
  'mediaStore', 'meetingStore', 'settingsStore',
)(MuteVideo);
