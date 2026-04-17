import React, { useCallback } from 'react';

import { ConnectionStatus } from '~meetings/ui/general';
import { DRONA_TROUBLESHOOTING_GUIDE_URL } from '~meetings/utils/constants';
import { mobxify } from '~meetings/ui/hoc';
import { VideoConnectionStates } from '~meetings/utils/videoConnection';
import ScreenShareErrors from './ScreenShareErrors';

function VideoChannelStatus({
  meetingStore: store,
  mediaStore,
  settingsStore,
}) {
  const { meeting } = store;
  const { videoBroadcasting } = meeting;
  const {
    audioHardwareError,
    hasAudioHardwareError,
    hasVideoHardwareError,
    videoHardwareError,
  } = mediaStore;

  const navigateToAudioSettings = useCallback(() => {
    settingsStore.setSettingsModalOpen(true);
    settingsStore.setActiveTab('audio');
  }, [settingsStore]);

  const navigateToVideoSettings = useCallback(() => {
    settingsStore.setSettingsModalOpen(true);
    settingsStore.setActiveTab('video');
  }, [settingsStore]);

  function connectionStateUi() {
    switch (videoBroadcasting.connectionState) {
      case VideoConnectionStates.failed:
        return (
          <ConnectionStatus
            actionFn={() => window.location.reload()}
            actionLabel="Reload"
            guideUrl={DRONA_TROUBLESHOOTING_GUIDE_URL}
            message="Connection has been interrupted"
            type="error"
          />
        );
      default:
        return null;
    }
  }


  if (videoBroadcasting.isLoading) {
    return <ConnectionStatus message="Connecting" />;
  } else if (videoBroadcasting.isCodecNotSupported) {
    const message = 'Your browser is not supported. '
      + 'We recommend using latest version of Chrome';
    return (
      <ConnectionStatus
        guideUrl={DRONA_TROUBLESHOOTING_GUIDE_URL}
        message={message}
        type="error"
      />
    );
  } else if (videoBroadcasting.loadError) {
    return (
      <ConnectionStatus
        actionFn={() => videoBroadcasting.join()}
        actionLabel="Try again"
        guideUrl={DRONA_TROUBLESHOOTING_GUIDE_URL}
        message="Failed to connect"
        type="error"
      />
    );
  } else if (videoBroadcasting.isStreamStarting) {
    return <ConnectionStatus message="Starting video stream" />;
  } else if (hasAudioHardwareError) {
    return (
      <ConnectionStatus
        actionFn={navigateToAudioSettings}
        actionLabel="Open Microphone Settings"
        guideUrl={DRONA_TROUBLESHOOTING_GUIDE_URL}
        message={audioHardwareError.message || 'Unable to load your microphone'}
        type="error"
      />
    );
  } else if (hasVideoHardwareError) {
    return (
      <ConnectionStatus
        actionFn={navigateToVideoSettings}
        actionLabel="Open Camera Settings"
        guideUrl={DRONA_TROUBLESHOOTING_GUIDE_URL}
        message={videoHardwareError.message || 'Unable to load your camera'}
        type="error"
      />
    );
  } else if (videoBroadcasting.streamStartError) {
    return (
      <ConnectionStatus
        actionFn={() => videoBroadcasting.streamMedia()}
        actionLabel="Try again"
        guideUrl={DRONA_TROUBLESHOOTING_GUIDE_URL}
        message="Failed to share video"
        type="error"
      />
    );
  } else if (videoBroadcasting.isScreenShareStarting) {
    return <ConnectionStatus message="Starting screen share" />;
  } else if (videoBroadcasting.screenShareError) {
    return <ScreenShareErrors />;
  } else {
    return connectionStateUi();
  }
}

export default mobxify(
  'meetingStore', 'mediaStore', 'settingsStore',
)(VideoChannelStatus);
