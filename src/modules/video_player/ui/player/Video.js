import React, {
  useCallback, useEffect, useRef,
} from 'react';
import classNames from 'classnames';
import Hls from 'hls.js';
import canAutoPlay from 'can-autoplay';

import { forwardRef } from '@common/ui/hoc';
import { isHlsSource } from '~video_player/utils/hls';
import { isIOS } from '@common/utils/platform';
import {
  useActions,
  useControlsFallback,
  useGlobalState,
} from '~video_player/hooks';

const ErrorTypes = {
  aborted: {
    code: 'ABORTED_PLAYBACK',
    message: 'Video playback was aborted',
  },
  network: {
    code: 'NOT_REACHABLE',
    message: 'Unable to load video due to network issues',
  },
  decodingError: {
    code: 'CANNOT_DECODE',
    message: 'We are unable to decode the video',
  },
  unsupported: {
    code: 'UNSUPPORTED_FORMAT',
    message: 'Video is either corrupt or your browser does not support it\'s '
      + 'format',
  },
  unknown: {
    code: 'UNKNOWN',
    message: 'Something wen\'t wrong. Please reload and try again',
  },
};

function parsedError(event) {
  const { error } = event.target;

  switch (error.code) {
    case error.MEDIA_ERR_ABORTED:
      return ErrorTypes.aborted;
    case error.MEDIA_ERR_NETWORK:
      return ErrorTypes.network;
    case error.MEDIA_ERR_DECODE:
      return ErrorTypes.decodingError;
    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return ErrorTypes.unsupported;
    default:
      return ErrorTypes.unknown;
  }
}

function Video({
  autoPlay,
  className,
  forwardedRef,
  maxBufferLength,
  onEnded,
  onError,
  onLoadedMetadata,
  onPlaying,
  onTimeUpdate,
  onSeeked,
  onSeeking,
  onWaiting,
  ...remainingProps
}) {
  const ref = useRef();
  const hls = useRef();

  const isFallback = useControlsFallback();

  const {
    bookmarkTime,
    currentResumeAt: resumeAt,
    currentSrc: src,
    hasControls,
    isMuted,
    isPlayedFromPlaylist,
    isPlaying,
    playbackRate,
    seekTo,
    selectedQualityLevel,
    volume,
  } = useGlobalState();

  const {
    addBookmark,
    setAppliedQuality,
    setBufferedIntervals,
    setCurrentTime,
    setDuration,
    setEnded,
    setError,
    setLoading,
    setMetaLoaded,
    setPlaying,
    setQualityLevels,
    setSeeking,
    setSeekTo,
    setSelectedQualityLevel,
    setPlayedIntervals,
    setPlayRestricted,
    setVideoPlayer,
    toggleMute,
  } = useActions();

  const handleHlsError = useCallback((event, data) => {
    const { type, fatal } = data;
    if (!fatal) {
      // For non fatal errors `hls.js` tries to recover from error by its own,
      // so we don't have to show error messages.
      return;
    }
    let error;
    switch (type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        error = ErrorTypes.network;
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        error = ErrorTypes.unsupported;
        break;
      default:
        error = ErrorTypes.unknown;
    }

    setError(error);

    if (onError) {
      onError(event, data);
    }
  }, [onError, setError]);

  const handleLevelSwitch = useCallback((_, { level }) => {
    setAppliedQuality(level);
  }, [setAppliedQuality]);

  useEffect(() => {
    if (!src) {
      return undefined;
    }

    if (Hls.isSupported() && isHlsSource(src)) {
      hls.current = new Hls({
        maxBufferLength,
        fragLoadPolicy: {
          default: {
            maxLoadTimeMs: 60000,
            maxTimeToFirstByteMs: 60000,
            errorRetry: {
              maxNumRetry: 10,
              retryDelayMs: 2000,
              maxRetryDelayMs: 8000,
              backoff: 'linear',
              shouldRetry: (retryConfig, retryCount) => {
                if (!retryConfig) {
                  return false;
                }
                // NOTE: In the hls.js library, the shouldRetry also checks
                // the http status code and if 4xx it does not retry
                // TODO: Debug why cloudfront raises intermittent 403 errors
                return retryCount < retryConfig.maxNumRetry;
              },
            },
            timeoutRetry: {
              maxNumRetry: 6,
              retryDelayMs: 2000,
              maxRetryDelayMs: 8000,
              backoff: 'linear',
            },
          },
        },
      });
      hls.current.startLevel = -1;
      hls.current.loadSource(src);
      hls.current.attachMedia(ref.current);
      hls.current.on(Hls.Events.ERROR, handleHlsError);
      hls.current.on(Hls.Events.LEVEL_SWITCHED, handleLevelSwitch);
    } else {
      ref.current.src = src;
    }

    return () => {
      if (hls.current) {
        hls.current.off(Hls.Events.ERROR, handleHlsError);
        hls.current.off(Hls.Events.LEVEL_SWITCHED, handleLevelSwitch);
        hls.current.destroy();
        hls.current = null;
      }
      // Reset quality levels
      setQualityLevels([]);
      setSelectedQualityLevel(-1);
      setAppliedQuality(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const videoPlayerEl = ref.current;
    setVideoPlayer(videoPlayerEl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  }, [isPlaying, src]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.playbackRate = playbackRate;
  }, [playbackRate, src]);

  useEffect(() => {
    if (!ref.current || !seekTo) {
      return;
    }

    ref.current.currentTime = seekTo;
    setSeekTo(null);
  }, [seekTo, setSeekTo]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.muted = isMuted;
  }, [isMuted, src]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.volume = volume;
  }, [src, volume]);

  useEffect(() => {
    if (hls.current) {
      hls.current.nextLevel = selectedQualityLevel;
    }
  }, [selectedQualityLevel]);

  const attachRef = useCallback(el => {
    ref.current = el;

    if (typeof forwardedRef === 'function') {
      forwardedRef(el);
    } else if (forwardedRef) {
      // eslint-disable-next-line no-param-reassign
      forwardedRef.current = el;
    }
  }, [forwardedRef]);

  const handleEnded = useCallback((event) => {
    setEnded(true);
    setPlaying(false);

    if (onEnded) {
      onEnded(event);
    }
  }, [onEnded, setEnded, setPlaying]);

  const handleError = useCallback((event) => {
    const error = parsedError(event);
    setError(error);

    if (onError) {
      onError(error);
    }
  }, [onError, setError]);

  const handleMetaDataLoad = useCallback(async (event) => {
    const { duration } = event.target;
    setDuration(duration);
    setMetaLoaded(true);

    if (resumeAt) {
      /**
       * In the case of iOS, the video element will not be able to seek to the
       * correct time as the timeframe is only loaded on demand not on metadata
       * loaded event. This is a workaround to seek to the correct time.
       */
      if (isIOS()) {
        ref.current.currentTime = resumeAt;
        ref.current.play();
        ref.current.pause();
      } else {
        ref.current.currentTime = resumeAt;
      }
    }

    if (autoPlay || isPlayedFromPlaylist) {
      setPlaying(true);
    }

    if (hls.current) {
      setQualityLevels(hls.current.levels);
    }

    const {
      result: isAutoplayAllowed,
    } = await canAutoPlay.video({ timeout: 100, muted: false, inline: true });

    if (!isAutoplayAllowed) {
      setPlayRestricted(true);
      toggleMute(true);
    }

    if (onLoadedMetadata) {
      onLoadedMetadata(event);
    }
  }, [
    autoPlay, isPlayedFromPlaylist, onLoadedMetadata, resumeAt, setDuration,
    setMetaLoaded, setPlaying, setQualityLevels, toggleMute, setPlayRestricted,
  ]);

  const handlePlaying = useCallback((event) => {
    setLoading(false);

    if (onPlaying) {
      onPlaying(event);
    }
  }, [onPlaying, setLoading]);

  const handleSeeking = useCallback((event) => {
    setSeeking(true);

    if (onSeeking) {
      onSeeking(event);
    }
  }, [onSeeking, setSeeking]);

  const handleSeeked = useCallback((event) => {
    setSeeking(false);
    if (onSeeked) {
      onSeeked(event);
    }
  }, [onSeeked, setSeeking]);

  const handleWaiting = useCallback((event) => {
    setLoading(true);

    if (onWaiting) {
      onWaiting(event);
    }
  }, [onWaiting, setLoading]);

  const handleTimeUpdate = useCallback((event) => {
    const { currentTime, played } = event.target;
    setCurrentTime(currentTime);
    setPlayedIntervals(played);
    setEnded(false);

    // If current time is updated while bookmark is being added update the
    // bookmark time as well. Generraly happens when user presses arrow keys
    // while adding bookmark
    if (bookmarkTime) {
      addBookmark(currentTime);
    }

    if (onTimeUpdate) {
      onTimeUpdate(event);
    }
  }, [
    addBookmark, bookmarkTime, onTimeUpdate, setCurrentTime,
    setPlayedIntervals, setEnded,
  ]);

  const handleProgress = useCallback((event) => {
    setBufferedIntervals(event.target.buffered);
  }, [setBufferedIntervals]);

  if (src) {
    return (
      <video
        ref={attachRef}
        className={classNames(
          'vp-video',
          { [className]: className },
        )}
        controls={hasControls && isFallback}
        controlsList="nodownload noremoteplayback"
        onEnded={handleEnded}
        onError={handleError}
        onLoadedMetadata={handleMetaDataLoad}
        onPlaying={handlePlaying}
        onProgress={handleProgress}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        onWaiting={handleWaiting}
        playsInline
        {...remainingProps}
      />
    );
  } else {
    return null;
  }
}

export default forwardRef(Video);
