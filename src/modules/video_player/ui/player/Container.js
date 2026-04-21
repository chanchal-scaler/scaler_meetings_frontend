import React, {
  lazy, useEffect, useImperativeHandle, useRef,
} from 'react';
import classNames from 'classnames';

import * as Browser from '@common/utils/browser';
import { forwardRef } from '@common/ui/hoc';
import { SuspenseLayout } from '@common/ui/layouts';
import { useActions, useGlobalState } from '~video_player/hooks';
import AutoplayFixBackdrop from '~video_player/ui/general/AutoplayFixBackdrop';
import ActionIndicator from '~video_player/ui/general/ActionIndicator';
import ErrorDialog from '~video_player/ui/general/ErrorDialog';

const Video = lazy(() => import('./Video'));

// List of all available event handlers
// eslint-disable-next-line
const events = [
  'onAbort', 'onCanPlay', 'onCanPlayThrough', 'onDurationChange', 'onEmptied',
  'onEncrypted', 'onEnded', 'onError', 'onLoadedData', 'onLoadedMetadata',
  'onLoadStart', 'onPause', 'onPlay', 'onPlaying', 'onProgress',
  'onRateChange', 'onSeeked', 'onSeeking', 'onStalled', 'onSuspend',
  'onTimeUpdate', 'onVolumeChange', 'onWaiting',
];

function Container({
  children,
  className,
  containerProps,
  forwardedRef,
  resumeAt,
  src,
  onFullscreenChange,
  ...remainingProps
}) {
  const ref = useRef(null);
  const {
    currentSrc,
    currentTime,
    quickAction,
    played,
    duration,
  } = useGlobalState();

  const {
    enterFullscreen,
    exitFullscreen,
    mute,
    pause,
    play,
    selectPlaylistVideo,
    setContainer,
    setPlaybackRate,
    setSeekTo,
    setVideo,
    setVolume,
    toggleMute,
    unMute,
    unsetQuickAction,
  } = useActions();

  useEffect(() => {
    function handleFullscreenChange(event) {
      const elem = event.target;
      const _isFullscreen = document.fullscreenElement === elem;
      if (!_isFullscreen) {
        exitFullscreen();
      }
      if (onFullscreenChange) {
        onFullscreenChange(_isFullscreen);
      }
    }

    const containerEl = ref.current;
    setContainer(containerEl);

    containerEl.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      containerEl.removeEventListener(
        'fullscreenchange', handleFullscreenChange,
      );
      Browser.exitFullscreen(containerEl);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (src) {
      setVideo(src, resumeAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Attached methods to ref
  useImperativeHandle(forwardedRef, () => ({
    currentSrc,
    currentTime,
    enterFullscreen,
    exitFullscreen,
    mute,
    pause,
    play,
    played,
    seek: setSeekTo,
    selectVideo: selectPlaylistVideo,
    setPlaybackRate,
    setVolume,
    toggleMute,
    unMute,
    duration,
  }));

  return (
    <div
      ref={ref}
      className={classNames(
        'vp-container',
        { [className]: className },
      )}
      tabIndex="-1"
      {...containerProps}
    >
      <SuspenseLayout>
        <Video {...remainingProps} />
      </SuspenseLayout>
      {children}
      <ActionIndicator
        key={quickAction || '-1'}
        action={quickAction}
        onAnimationEnd={unsetQuickAction}
      />
      <ErrorDialog />
      <AutoplayFixBackdrop />
    </div>
  );
}

export default forwardRef(Container);
