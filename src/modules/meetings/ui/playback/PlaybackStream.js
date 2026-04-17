import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { mobxify } from '~meetings/ui/hoc';
import { PlaybackStates } from '~meetings/utils/playback';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import VideoPlayer from '~video_player';

// Num seconds of difference accepted in video playback
const ALLOWED_PLAYBACK_DIFF = 12;

// Sync playback every 4s even if no status has changed
const PLAYBACK_SYNC_INTERVAL = 4000; // In ms

function PlaybackStream({ children, className, meetingStore: store }) {
  const videoPlayer = useRef();
  const { meeting } = store;
  const { playback, videoBroadcasting } = meeting;

  useEffect(() => {
    if (playback.isUserController) {
      if (playback.isActive) {
        videoBroadcasting.setMute('audio', true, 'playbackStream');
      } else {
        videoBroadcasting.setMute('audio', false, 'playbackStream');
      }
    }
    // eslint-disable-next-line
  }, [playback.isActive]);

  useEffect(() => {
    function handleUnload() {
      playback.togglePlaying(false);
    }

    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [playback]);

  useEffect(() => {
    if (meeting.isSuperHost) {
      const interval = setInterval(() => {
        playback.saveProgress();
      }, PLAYBACK_SYNC_INTERVAL);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [meeting.isSuperHost, playback]);

  useEffect(() => {
    if (playback.state === PlaybackStates.playing) {
      videoPlayer.current.play();
    } else {
      videoPlayer.current.pause();
    }
  }, [playback.state]);

  useEffect(() => {
    if (playback.isMuted) {
      videoPlayer.current.mute();
    } else {
      videoPlayer.current.unMute();
    }
  }, [playback.isMuted]);

  useEffect(() => {
    videoPlayer.current.setPlaybackRate(playback.rate);
  }, [playback.rate]);

  useEffect(() => {
    const diff = Math.abs(
      playback.currentTime - videoPlayer.current.currentTime,
    );
    if (diff > ALLOWED_PLAYBACK_DIFF || playback.isSeeked) {
      videoPlayer.current.seek(playback.currentTime);
      playback.setSeeked(false);
    }
  }, [playback, playback.currentTime, playback.isSeeked]);

  const handleTimeUpdate = useCallback((event) => {
    const { currentTime } = event.target;
    playback.setLocalCurrentTime(currentTime);
  }, [playback]);

  const handlePlay = useCallback(() => {
    playback.togglePlaying(true);
  }, [playback]);

  const handlePause = useCallback(() => {
    playback.togglePlaying(false);
  }, [playback]);

  const handleSeeked = useCallback(() => {
    playback.seeked();
  }, [playback]);

  const handleVolumeChange = useCallback((event) => {
    playback.toggleMute(event.target.muted);
  }, [playback]);

  const handleRateChange = useCallback((event) => {
    playback.changeRate(event.target.playbackRate);
  }, [playback]);

  return (
    <VideoPlayer
      key={playback.id}
      src={playback.videoUrl}
      ref={videoPlayer}
      className={classNames(
        'm-playback-stream',
        { [className]: className },
      )}
      onTimeUpdate={handleTimeUpdate}
      onPlay={handlePlay}
      onPause={handlePause}
      onRateChange={handleRateChange}
      onSeeked={handleSeeked}
      onVolumeChange={handleVolumeChange}
      singletonsNamespace={SINGLETONS_NAME}
    >
      {meeting.isSuperHost && <VideoPlayer.Controls />}
      {children}
    </VideoPlayer>
  );
}

export default mobxify('meetingStore')(PlaybackStream);
