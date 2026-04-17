import React, { useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';

import {
  Avatar, DropdownItem, Icon, Tappable,
} from '@common/ui/general';
import { HintLayout } from '@common/ui/layouts';
import { isSafari } from '@common/utils/platform';
import PoorUploadTips from '~meetings/ui/meeting/PoorUploadTips';
import {
  isHighCostScreenShare,
  screenQualityHintsMap,
  screenQualityLabelsMap,
  ScreenShareQuality,
} from '~meetings/utils/media';
import { toast } from '@common/ui/general/Toast';

import mediaStore from '~meetings/stores/mediaStore';
import StreamVideo from './StreamVideo';

// Unsubscribe video from stream if the video is hidden for more than below
// specified time. Audio would still be subscribed though.
const VIDEO_DISABLE_TIMEOUT = 3000;
// If local stream remains muted for below time then it is considered inactive
const INACTIVE_TIMEOUT = 180 * 1000;
// If local stream of temporary host is found inactive then revoke temporary
// host access after the below time
const SWITCH_ROLE_TIMEOUT = 10 * 1000;

function WebRTCVideo({
  avatarSize,
  hidden,
  stream,
  type,
}) {
  const disableVideoRef = useRef(null);
  const { manager, meeting } = stream;
  const videoBroadcasting = stream.channel;

  // Logic that unsubscribes video for remote streams when they are not visible
  useEffect(() => {
    if (
      !stream.isRemote
      || isSafari()
      || stream.isVideoDisabled
      // No need to handle unsubscribing in granular mode as `useStreamPlayback`
      // handles it for us.
      || stream.isGranularMode
    ) {
      return undefined;
    }

    if (hidden) {
      disableVideoRef.current = setTimeout(() => {
        stream.toggleVideo(true);
      }, VIDEO_DISABLE_TIMEOUT);
    } else {
      stream.toggleVideo(false);
    }

    return () => {
      clearTimeout(disableVideoRef.current);
      disableVideoRef.current = null;
    };
  }, [hidden, stream]);

  useEffect(() => {
    if (
      manager.isTemporaryHost
      && !stream.isRemote
      && !stream.isLocalScreenShare
      && stream.isAudioMuted
    ) {
      const inactiveTimeoutId = setTimeout(() => {
        toast.show({
          duration: 5000,
          message: 'Your access to talk with the host will be revoked in '
            + 'sometime due to inactivity',
        });
      }, INACTIVE_TIMEOUT);

      const switchRoleTimeoutId = setTimeout(() => {
        meeting.setSelectedRole('audience');
        manager.setTemporaryHost(false);
        meeting.track('autoMuted');
        toast.show({
          duration: 3000,
          message: 'Your access to talk with the host has been revoked due to '
            + 'inactivity',
        });
      }, INACTIVE_TIMEOUT + SWITCH_ROLE_TIMEOUT);

      return () => {
        clearTimeout(inactiveTimeoutId);
        clearTimeout(switchRoleTimeoutId);
      };
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream.isAudioMuted]);

  // Effect that auto rotates screen on mobile/tablet for pinned streams
  // useEffect(() => {
  //   if (isPinned && ref.current) {
  //     store.enterFullscreen(ref.current);

  //     return () => store.exitFullscreen();
  //   }

  //   return undefined;
  // }, [isPinned, store]);

  const handleMessage = useCallback(() => {
    const { messaging } = meeting;
    messaging.setMessageToId(stream.participant.userId);
    meeting.setActiveTab('chat');
  }, [meeting, stream.participant.userId]);

  const handleResume = useCallback((event) => {
    event.stopPropagation();
    stream.resume();
  }, [stream]);

  const screenShareInfo = useCallback(() => {
    if (meeting.isNewScreenShareEnabled) {
      return (
        <div>
          <h3 className="bold">
            You are sharing your screen
          </h3>
          <div>
            The chosen setting is being applied to your screen share session.
          </div>
          <div className="m-20">
            {screenQualityLabelsMap[mediaStore.screenQuality]}
            {' '}
            (
            {screenQualityHintsMap[mediaStore.screenQuality]}
            )
          </div>
          {isHighCostScreenShare(mediaStore.screenQuality)
            ? (
              <div className="normal video-playback__hq-warning">
                Please use this feature responsibly, enabling this
                will result in 2x of the cost of the call from our platform
                partner.
                <br />
                {' '}
                Do not use this for more than 30 mins in a live class.
              </div>
            )
            : null}
        </div>
      );
    } else {
      return 'You are sharing your screen now';
    }
  }, [meeting.isNewScreenShareEnabled]);

  function playbackInfoUi() {
    // For local screen shares do not show streams
    if (stream.isLocalScreenShare) {
      return (
        <div className="column flex-c full-height">
          {videoBroadcasting.currentScreenQuality === ScreenShareQuality.low
            && <PoorUploadTips className="m-t-20" />}
          <HintLayout
            actionFn={() => videoBroadcasting.unshareScreen()}
            actionLabel="Stop Sharing"
            isFit
            isTransparent
            message={screenShareInfo()}
          />
        </div>
      );
    } else if (
      stream.isVideoMuted
      || stream.isVideoDisabled
      || stream.isAudioFallback
    ) {
      if (stream.isScreenShare) {
        return (
          <div className="video-playback__fallback">
            <div className="row flex-c">
              <Icon name="pause" />
              {
                stream.isVideoMuted && (
                  <div className="m-l-5">
                    Screen share has been paused by the presenter
                  </div>
                )
              }
            </div>
          </div>
        );
      } else {
        return (
          <div className="video-playback__fallback">
            <Avatar
              image={stream.participant.avatar}
              size={avatarSize}
              title={stream.participant.name}
            />
            {(stream.isAudioFallback
              || stream.videoDisableMode === 'network')
              && (
                <p className="no-mgn-b m-t-10 h5 text-c">
                  Video disabled due to poor network
                </p>
              )}
          </div>
        );
      }
    } else if (stream.hasVideoError) {
      return (
        <div className="video-playback__fallback">
          <div className="row flex-c text-shadow">
            <Icon className="m-r-5" name="info" />
            <div>Failed to load video!</div>
          </div>
          {stream.isComposedMode && (
            <Tappable
              className="btn btn-primary btn-small m-t-10"
              onClick={handleResume}
            >
              Try again
            </Tappable>
          )}
        </div>
      );
    } else {
      return null;
    }
  }

  // eslint-disable-next-line no-unused-vars
  // function maximiseUi() {
  //   return (
  //     <DropdownItem
  //       className="dark"
  //       onClick={handleFullscreenToggle}
  //     >
  //       <Icon
  //         className="m-r-10"
  //         name={isPinned ? 'fullscreen-exit' : 'fullscreen'}
  //       />
  //       <span>
  //         {isPinned ? 'Minimise' : 'Maximise'}
  //       </span>
  //     </DropdownItem>
  //   );
  // }

  // eslint-disable-next-line no-unused-vars
  function messageUi() {
    const { messaging } = meeting;
    if (
      !stream.participant.isCurrentUser
      && messaging
      && messaging.canSendMessageTo(stream.userId)
    ) {
      return (
        <DropdownItem
          className="dark"
          onClick={handleMessage}
        >
          <Icon
            className="m-r-10"
            name="chat"
          />
          <span>
            Send Message
          </span>
        </DropdownItem>
      );
    } else {
      return null;
    }
  }

  return (
    <StreamVideo
      stream={stream}
      type={type}
      shouldNotPlay={stream.isLocalScreenShare}
      isPlaybackHidden={
        stream.isVideoMuted
        || stream.isVideoDisabled
        || stream.isAudioFallback
        || hidden
      }
      canDisableVideo={stream.isRemote}
    >
      {playbackInfoUi()}
    </StreamVideo>
  );
}

export default observer(WebRTCVideo);
