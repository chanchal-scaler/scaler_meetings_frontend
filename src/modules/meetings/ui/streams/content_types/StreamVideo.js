import React, { useRef, useCallback, useEffect } from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import {
  GestureDetector, Icon, Tooltip, Tappable,
} from '@common/ui/general';
import { IconButton } from '~meetings/ui/general';
import { isFunction } from '@common/utils/type';
import { isSafari, isScalerAndroidApp } from '@common/utils/platform';
import { isSpeakerChangeSupported } from '~meetings/utils/media';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaQuery } from '@common/hooks';
import { useStreamPlayback } from '~meetings/hooks';
import analytics from '@common/utils/analytics';
import NetworkIndicator from '~meetings/ui/NetworkIndicator';
import ZoomInAndOut from '~meetings/ui/ZoomInAndOut';

function StreamVideo({
  layoutStore,
  mediaStore,
  stream,
  type,
  shouldNotPlay = false,
  isPlaybackHidden = false,
  canDisableVideo = true,
  children,
}) {
  const { desktop } = useMediaQuery();
  const id = `stream-${stream.id}`;
  const ref = useRef(null);
  const videoBroadcasting = stream.channel;
  const isPinned = videoBroadcasting.pinnedStreamId === stream.id;

  useStreamPlayback({
    stream, elementId: id, shouldNotPlay, isPlaybackHidden,
  });

  useEffect(() => {
    if (isSpeakerChangeSupported() && ref.current) {
      if (isFunction(stream.setAudioOutputDevice)) {
        stream.setAudioOutputDevice(mediaStore.speakerDeviceId);
      } else {
        const videoEl = ref.current.querySelector('video');
        if (videoEl) {
          videoEl.setSinkId(mediaStore.speakerDeviceId);
        }
      }
    }
  }, [mediaStore.speakerDeviceId, stream]);


  const handleFullscreenToggle = useCallback(() => {
    if (type !== 'primary') {
      return;
    }

    if (isPinned) {
      videoBroadcasting.setPinnedStreamId(null);
    } else {
      videoBroadcasting.setPinnedStreamId(stream.id);
    }
  }, [isPinned, stream.id, type, videoBroadcasting]);

  const handlePopOut = useCallback(() => {
    videoBroadcasting.setPinnedStreamId(null);
    videoBroadcasting.setScreenShareMaximised(true);
  }, [videoBroadcasting]);

  const handlePopIn = useCallback(() => {
    videoBroadcasting.setPinnedStreamId(null);
    videoBroadcasting.setScreenShareMaximised(false);
  }, [videoBroadcasting]);

  const handleVideoToggle = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaDisableIncomingVideo,
      click_source: DRONA_SOURCES.meetingVideoCard,
      click_text: 'Disable incoming video',
      click_feature: DRONA_FEATURES.video,
    });
    stream.setVideoDisabled(stream.isVideoDisabled ? null : 'manual');
  }, [stream]);

  const handleResume = useCallback((event) => {
    event.stopPropagation();
    stream.resume();
  }, [stream]);

  function fullscreenUi() {
    if (type === 'primary') {
      return (
        <IconButton
          className="video-playback__action"
          icon={isPinned ? 'minimize-variant' : 'maximize-variant'}
          onClick={handleFullscreenToggle}
          small
        />
      );
    } else {
      return null;
    }
  }

  function popoutUi() {
    if (!desktop || !layoutStore.isScreenMaximiseAllowed) {
      return null;
    } else if (type === 'secondary') {
      return (
        <IconButton
          className="video-playback__action"
          icon="pop-in"
          onClick={handlePopIn}
          small
        />
      );
    } else if (!stream.isScreenShare) {
      return (
        <IconButton
          className="video-playback__action"
          icon="pop-out"
          onClick={handlePopOut}
          small
        />
      );
    } else {
      return null;
    }
  }

  function networkUi() {
    if (isPinned) {
      return (
        <NetworkIndicator
          className="video-playback__action"
          small
        />
      );
    } else {
      return null;
    }
  }

  function disableVideoUi() {
    if (canDisableVideo && !isSafari()) {
      return (
        <IconButton
          className="video-playback__action"
          icon="camera-off"
          label="Disable incoming video"
          onClick={handleVideoToggle}
          small
          type={stream.isVideoDisabled ? 'danger' : 'default'}
        />
      );
    } else {
      return null;
    }
  }

  function headerUi() {
    return (
      <div className="video-playback__header">
        <div className="row flex-c">
          {networkUi()}
          {popoutUi()}
          {disableVideoUi()}
          {fullscreenUi()}
        </div>
      </div>
    );
  }

  function audioUi() {
    if (stream.isScreenShare) {
      return (
        <Icon
          className="primary"
          name="share-screen"
        />
      );
    } else if (stream.isAudioMuted) {
      return (
        <Icon
          className="danger"
          name="mic-off"
        />
      );
    } else if (stream.hasAudioError) {
      return (
        <Tooltip
          className="btn btn-danger btn-icon btn-small"
          component={Tappable}
          onClick={handleResume}
          title="Failed to start stream. Click to retry"
        >
          <Icon name="info" />
        </Tooltip>
      );
    } else {
      return (
        <Icon
          className="primary"
          name="mic"
        />
      );
    }
  }

  function userUi() {
    return (
      <div className="video-playback__footer">
        {audioUi()}
        <div className="video-playback__name">
          {stream.label}
        </div>
      </div>
    );
  }

  function ui() {
    return (
      <GestureDetector
        ref={ref}
        onDoubleClick={handleFullscreenToggle}
        className={classNames(
          'video-playback',
          `video-playback--${type}`,
          {
            'video-playback--hidden': isPlaybackHidden,
          },
          { 'video-playback--recording': layoutStore.isRecording },
        )}
        id={id}
      >
        <div className="video-playback__overlay">
          {!layoutStore.isRecording && headerUi()}
          <div className="video-playback__info">
            {children}
          </div>
          {userUi()}
        </div>
      </GestureDetector>
    );
  }

  if (isScalerAndroidApp()) {
    return <ZoomInAndOut>{ui()}</ZoomInAndOut>;
  } else {
    return ui();
  }
}

export default mobxify('layoutStore', 'mediaStore')(StreamVideo);
