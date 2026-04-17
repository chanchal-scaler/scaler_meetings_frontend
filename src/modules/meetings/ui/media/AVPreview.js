import React, { useCallback, useEffect } from 'react';
import compose from 'lodash/fp/compose';

import { AspectRatio } from '@common/ui/general';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { HintLayout } from '@common/ui/layouts';
import { IconButton } from '~meetings/ui/general';
import { isNullOrUndefined } from '@common/utils/type';
import { mobxify, withPermissions } from '~meetings/ui/hoc';
import { useMediaStream } from '~meetings/hooks';
import analytics from '@common/utils/analytics';
import AudioIndicator from './AudioIndicator';

function AVPreview({ mediaStore: store, meetingStore, settingsStore }) {
  const { meeting } = meetingStore;

  const {
    hasAudioHardwareError,
    hasVideoHardwareError,
    videoHardwareError,
    audioHardwareError,
  } = store;

  const {
    playerRef, stream: videoStream, streamError: videoStreamError,
    streamLoading: videoStreamLoading,
  } = useMediaStream({
    video: store.videoConstraints,
    shouldLoad: (
      store.video
      && store.hasVideoPermissions
      && !hasVideoHardwareError
    ),
  });

  const {
    stream: audioStream, streamError: audioStreamError,
    streamLoading: audioStreamLoading,
  } = useMediaStream({
    audio: store.audioConstraints,
    shouldLoad: (
      store.audio
      && store.hasAudioPermissions
      && !hasAudioHardwareError
    ),
  });

  useEffect(() => {
    store.setVideoStreamLoading(videoStreamLoading);
  }, [store, videoStreamLoading]);

  useEffect(() => {
    store.setAudioStreamLoading(audioStreamLoading);
  }, [audioStreamLoading, store]);

  /**
   * Audio/Video stream errors can occur when camera/microphone is not available
   * and/or when the device is corrupted.
   */
  useEffect(() => {
    const hasAudioStreamError = !isNullOrUndefined(audioStreamError);

    if (hasAudioStreamError) {
      store.setEnabledHardware({
        video: store.video,
        audio: false,
      });
      store.setHardwareError(audioStreamError, 'audio');
    } else {
      store.setEnabledHardware({
        video: store.video,
        audio: true,
      });
      meeting.setJoinMode('audio', true);
      store.resetHardwareError('audio');
    }
  }, [audioStreamError, meeting, store]);

  useEffect(() => {
    const hasVideoStreamError = !isNullOrUndefined(videoStreamError);

    if (hasVideoStreamError) {
      store.setEnabledHardware({
        video: false,
        audio: store.audio,
      });
      store.setHardwareError(videoStreamError, 'video');
    } else {
      store.setEnabledHardware({
        video: true,
        audio: store.audio,
      });
      meeting.setJoinMode('video', true);
      store.resetHardwareError('video');
    }
  }, [meeting, store, videoStreamError]);

  useEffect(() => {
    meeting.resetJoinMode();
  }, [meeting]);

  const handlePlay = useCallback(() => {
    playerRef.current.play();
  }, [playerRef]);

  const handleRequestPermissions = useCallback(() => {
    store.setEnabledHardware({ video: true, audio: true });
    store.requestPermissions();
  }, [store]);

  const handleOpenSettingsModal = useCallback(() => {
    settingsStore.setSettingsModalOpen(true);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaSettingsClick,
      click_feature: DRONA_FEATURES.meetingJoinFlow,
      click_source: DRONA_SOURCES.meetingPreJoinModal,
    });
  }, [settingsStore]);

  const handleUpdateMicrophoneState = useCallback((state) => {
    meeting.setJoinMode('audio', state);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaAudioToggleClick,
      click_feature: DRONA_FEATURES.meetingJoinFlow,
      click_source: DRONA_SOURCES.meetingPreJoinModal,
      custom: {
        audio_state: state,
      },
    });
  }, [meeting]);

  const handleUpdateCameraState = useCallback((state) => {
    meeting.setJoinMode('video', state);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaVideoToggleClick,
      click_feature: DRONA_FEATURES.meetingControls,
      click_source: DRONA_SOURCES.meetingPreJoinModal,
      custom: {
        video_state: state,
      },
    });
  }, [meeting]);

  function messageUi() {
    const disabled = [];

    if (!meeting.joinWithVideo) {
      disabled.push('cam');
    }

    if (!meeting.joinWithAudio) {
      disabled.push('mic');
    }

    if (disabled.length > 0) {
      return (
        <div className="av-preview__message">
          Join with
          {' '}
          {
            /**
             * This login only works as long as disabled array length is not
             * more than 2
             */
          }
          {disabled.join(' and ')}
          {' '}
          off
        </div>
      );
    } else {
      return null;
    }
  }

  function audioUi() {
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
          onClick={handleRequestPermissions}
        />
      );
    } else if (audioStreamError) {
      return (
        <IconButton
          label="
            Microphone is not responding. Please select a different microphone.
          "
          className="av-preview__action av-preview__action--audio btn-light"
          icon="mic-off"
          type="danger"
        />
      );
    } else if (meeting.joinWithAudio) {
      return (
        <AudioIndicator
          stream={audioStream}
          className="av-preview__action av-preview__action--audio btn-light"
          onClick={() => handleUpdateMicrophoneState(false)}
        />
      );
    } else {
      return (
        <IconButton
          className="av-preview__action av-preview__action--audio btn-light"
          icon="mic-off"
          onClick={() => handleUpdateMicrophoneState(true)}
          type="danger"
        />
      );
    }
  }

  function videoUi() {
    if (hasVideoHardwareError) {
      return (
        <IconButton
          label={(
            videoHardwareError.message
            || 'Unable to load your camera'
          )}
          className="av-preview__action av-preview__action--video btn-light"
          icon="camera-off"
          type="danger"
          onClick={handleRequestPermissions}
        />
      );
    } else if (videoStreamError) {
      return (
        <IconButton
          label="Camera is not responding. Please select a different camera."
          className="av-preview__action av-preview__action--video btn-light"
          icon="camera-off"
          type="danger"
        />
      );
    } else if (meeting.joinWithVideo) {
      return (
        <IconButton
          className="av-preview__action av-preview__action--video btn-light"
          icon="camera"
          onClick={() => handleUpdateCameraState(false)}
          label={(
            <span style={{ textAlign: 'center' }}>
              <h5>
                Keep your camera on!
              </h5>
              <h6>
                Recommended for effective interaction
              </h6>
            </span>
          )}
        />
      );
    } else {
      return (
        <IconButton
          className="av-preview__action av-preview__action--video btn-light"
          icon="camera-off"
          onClick={() => handleUpdateCameraState(true)}
          type="danger"
        />
      );
    }
  }

  function settingsUi() {
    return (
      <IconButton
        className="av-preview__action av-preview__action--settings btn-light"
        icon="settings"
        onClick={handleOpenSettingsModal}
      />
    );
  }

  function controlsUi() {
    return (
      <div className="av-preview__controls">
        {audioUi()}
        {videoUi()}
        {settingsUi()}
      </div>
    );
  }

  function previewUi() {
    if (hasVideoHardwareError) {
      return (
        <HintLayout
          isTransparent
          message={(
            videoHardwareError.message
            || 'Unable to load your camera'
          )}
        />
      );
    } else if (videoStreamError) {
      return (
        <HintLayout
          isTransparent
          message="Camera is not responding. Please select a different camera."
        />
      );
    } else if (!store.hasSelectedVideoInput) {
      /**
       * If we have videoInputs, and don't have any default video device,
       * we should prompt user to select video device
       */
      return (
        <HintLayout
          isTransparent
          message="Please select a camera"
        />
      );
    } else if (store.video && !isNullOrUndefined(videoStream)) {
      return (
        <video
          ref={playerRef}
          className="av-preview__video"
          muted
          onLoadedMetadata={handlePlay}
          playsInline
        />
      );
    } else if (store.video && isNullOrUndefined(videoStream)) {
      return (
        <HintLayout
          isTransparent
          message="Camera is starting"
        />
      );
    } else {
      return (
        <HintLayout
          isTransparent
          message="Camera is off"
        />
      );
    }
  }

  return (
    <AspectRatio
      containerClassName="av-preview"
      ratio={16 / 9}
      dataCy="av-preview"
    >
      {previewUi()}
      {messageUi()}
      {controlsUi()}
    </AspectRatio>
  );
}

const hoc = compose(
  withPermissions,
  mobxify('mediaStore', 'meetingStore', 'settingsStore'),
);

export default hoc(AVPreview);
