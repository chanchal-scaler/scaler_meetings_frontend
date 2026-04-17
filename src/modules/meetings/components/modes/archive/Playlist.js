import React, {
  useCallback, useEffect, useRef,
} from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { ErrorBoundary, Icon } from '@common/ui/general';
import { HintLayout } from '@common/ui/layouts';
import { humanizeTime } from '@common/utils/date';
import { logEvent } from '@common/utils/logger';
import { useThrottled, useVisibilityChange } from '@common/hooks';
import { mobxify } from '~meetings/ui/hoc';
import { isNullOrUndefined } from '@common/utils/type';
import { isWindowHidden } from '@common/utils/browser';
import {
  SINGLETONS_NAME,
  MEETING_ACTION_TRACKING,
} from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';
import GenericNudgeContainer
  from '~meetings/components/nudges/GenericNudgeContainer';
import VideoPlayer from '~video_player';

// Video intervals are captured once every `CAPTURE_EVENTS_INTERVAL` time.
const CAPTURE_EVENTS_INTERVAL = 30000; // In ms

// Current Playing Time is captured
const SYNC_CURRENT_PLAYING_TIME_INTERVAL = 60000; // In ms

// Max length of video to preload
const FUTURE_VIDEO_BUFFER_SIZE = 300; // In sec

function Playlist({ children, meetingStore: store }) {
  const { archive } = store;
  const videoPlayer = useRef(null);
  const resumeVideo = useRef(false);
  const containerRef = useRef(null);

  const syncPlayingTime = useThrottled(currentTime => {
    archive.syncCurrentPlayingTime(currentTime);
  }, SYNC_CURRENT_PLAYING_TIME_INTERVAL, [archive]);

  // TODO: Combine the above and below method into one!
  const syncPlayingTimeInEvent = useThrottled(currentTime => {
    archive.syncCurrentPlayingTime(currentTime);
  }, 500, [archive]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { played } = videoPlayer.current;
      archive.captureEventsNatively(played);
    }, CAPTURE_EVENTS_INTERVAL);
    return () => {
      clearInterval(interval);
      archive.syncCapturedEvents();
    };
  }, [archive]);

  useEffect(() => {
    if (archive.selectedVideo && videoPlayer.current) {
      const { resumeAt, src } = archive.selectedVideo;
      videoPlayer.current.selectVideo(src, resumeAt);
      videoPlayer.current.play();
      archive.setSelectedVideo(null);
    }
  }, [archive, archive.selectedVideo]);

  useEffect(() => {
    if (!videoPlayer.current) {
      return;
    }

    if (archive.isPlaying) {
      resumeVideo.current = true;
      videoPlayer.current.play();
    } else {
      resumeVideo.current = false;
      videoPlayer.current.pause();
    }
  }, [archive.isPlaying]);

  const handleTimeUpdate = useCallback((event) => {
    const { currentTime } = event.target;
    archive.setCurrentTimestamp(currentTime);
    archive.updateDurationQueue(currentTime);
    archive.updateResumeAt(currentTime);
    syncPlayingTime(currentTime);
  }, [archive, syncPlayingTime]);

  const handleEventUpdate = useCallback((event, force = false) => {
    const { type, target: { currentTime, paused, played } } = event;
    const isPlaying = !paused;

    if (!played) {
      handleTimeUpdate(event);
      archive.captureEvent(type, currentTime, isPlaying, force);
    } else {
      syncPlayingTimeInEvent(currentTime);
    }
  }, [archive, handleTimeUpdate, syncPlayingTimeInEvent]);

  const beforeWindowUnload = useCallback((event) => {
    event.preventDefault();
    if (!videoPlayer?.current) {
      analytics.log({
        log_type: DRONA_TRACKING_TYPES.dronaWindowUnloadTracking,
        log_feature: DRONA_FEATURES.meetingUnload,
        log_source: DRONA_SOURCES.meetingWindowUnload,
        custom: {
          stores: window.__MOBX_STORES__,
          playlist: archive.playlist,
          currentPath: window.location.href,
        },
      });
    }
    const force = true;
    const { currentTime, played } = videoPlayer.current;
    if (!played) {
      handleEventUpdate({
        type: 'pause',
        target: {
          currentTime,
          paused: true,
        },
      }, force);
    } else {
      archive.captureEventsNatively(played);
    }
    archive.saveProgressInLS();
    archive.syncCurrentPlayingTime(currentTime);
  }, [archive, handleEventUpdate]);

  useEffect(() => {
    window.removeEventListener('beforeunload', beforeWindowUnload, true);
    window.addEventListener('beforeunload', beforeWindowUnload, true);

    // without clearing the event listener
    // the event listener was present on every screen and got fired on reload
    // when there is no video element this throws error
    return () => {
      window.removeEventListener('beforeunload', beforeWindowUnload, true);
    };
  }, [beforeWindowUnload]);

  const handleVideoChange = useCallback((index) => {
    archive.setCurrentRecordingIndex(index);
  }, [archive]);

  const handleFullscreenChange = (isFullscreen) => {
    archive.setFullscreen(isFullscreen);
  };

  const handleError = useCallback((event, data) => {
    logEvent(
      'error',
      'ArchiveVideoError: Failed to play video',
      { event, data },
    );
    archive.trackEvent(
      MEETING_ACTION_TRACKING.archiveVideoError,
      { event, data },
    );
  }, [archive]);

  const handleBookmarkUpdate = useCallback((payload) => {
    archive.updateBookmark({ ...payload, description: payload.title });
  }, [archive]);

  const handleVisibilityChange = useCallback(
    (event) => {
      let shouldTrackEvents = false;
      // if pagehide event(for safari/iOS)
      if (
        !isNullOrUndefined(event.persisted) && !event.persisted
      ) shouldTrackEvents = true;
      // if visibility change event
      if (isWindowHidden()) shouldTrackEvents = true;
      if (shouldTrackEvents) {
        archive.syncCapturedEvents();
      }
    },
    [archive],
  );
  useVisibilityChange(handleVisibilityChange);

  function itemUi(item, index) {
    return (
      <VideoPlayer.PlaylistItem
        key={index}
        className="m-playlist-item"
        resumeAt={item.resumeAt}
        selectedClassName="m-playlist-item--selected"
        src={item.src}
        title={item.title}
      >
        <div className="m-playlist-item__icon">
          <Icon name="camera" />
        </div>
        <div className="m-playlist-item__body">
          <h3 className="m-playlist-item__title normal no-mgn-b">
            {item.title}
          </h3>
          <div className="m-playlist-item__duration">
            <Icon
              className="m-r-5"
              name="clock"
            />
            <span className="hint">
              {humanizeTime(item.duration)}
            </span>
          </div>
        </div>
      </VideoPlayer.PlaylistItem>
    );
  }

  function bookmarkUi(bookmark) {
    const canEdit = (
      parseInt(archive.user.user_id, 10) === bookmark.user_id
      && bookmark.bookmark_type !== 'question'
    );
    return (
      <VideoPlayer.Bookmark
        key={bookmark.slug}
        className={classNames(
          'm-bookmark-marker',
          `m-bookmark-marker--${bookmark.bookmark_type}`,
        )}
        canEdit={canEdit}
        inputClassName={`m-bookmark-player-input--${bookmark.bookmark_type}`}
        slug={bookmark.slug}
        title={bookmark.description || bookmark.title}
        time={bookmark.start_time}
      />
    );
  }

  function ui() {
    if (archive.playlist.length === 0) {
      return (
        <HintLayout
          isTransparent
          message="No recordings available"
        />
      );
    } else {
      return (
        <VideoPlayer
          ref={videoPlayer}
          className="archive-player"
          data-cy="archived-meeting-video-player"
          maxBufferLength={FUTURE_VIDEO_BUFFER_SIZE}
          onTimeUpdate={handleTimeUpdate}
          onVideoChange={handleVideoChange}
          onPlay={handleEventUpdate}
          onPause={handleEventUpdate}
          onSeeked={handleEventUpdate}
          onFullscreenChange={handleFullscreenChange}
          onError={handleError}
          singletonsNamespace={SINGLETONS_NAME}
        >
          <VideoPlayer.Controls
            newBookmarkInputClassName={
              archive.isSuperHost
                ? 'm-bookmark-player-input--admin'
                : 'm-bookmark-player-input--user'
            }
            onBookmarkAdd={archive.addBookmark}
            onBookmarkDelete={archive.deleteBookmark}
            onBookmarkUpdate={handleBookmarkUpdate}
            onVisibilityChange={archive.setPlayerControlsVisible}
            playbackTooltip={archive.type === 'lecture_hall' && (
              <>
                Increasing the speed of the lecture video
                <br />
                will not affect your attendance
              </>
            )}
          >
            {archive.currentBookmarks.map(bookmarkUi)}
          </VideoPlayer.Controls>
          <VideoPlayer.Playlist>
            {archive.playlist.map(itemUi)}
          </VideoPlayer.Playlist>
          {children}
        </VideoPlayer>
      );
    }
  }

  return (
    <div ref={containerRef} className="m-playlist">
      {ui()}
      <ErrorBoundary>
        <GenericNudgeContainer popoverRef={containerRef} />
      </ErrorBoundary>
    </div>
  );
}

export default mobxify('meetingStore')(Playlist);
