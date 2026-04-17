import React, { useCallback, useEffect } from 'react';

import { Backdrop, Icon } from '@common/ui/general';
import { useActions, useGlobalState } from '~video_player/hooks';

/**
 * `AutoplayFixBackdrop` is a backdrop that is shown when the video
 * needs to be played but the user agent is not allowed to autoplay unmuted
 * videos. It is shown when the user clicks the play button and inline unmuted
 * autoplay is disabled. Currently happens on Safari on iOS/iPadOS/macOS.
 */
function AutoplayFixBackdrop() {
  const {
    isPlaying, isPlayRestricted, isMuted, videoPlayerEl,
  } = useGlobalState();
  const { setPlayRestricted, toggleMute } = useActions();
  const isOpen = isPlaying && isPlayRestricted && isMuted;

  const handleAcknowledgement = useCallback(() => {
    setPlayRestricted(false);
    toggleMute(false);
    if (videoPlayerEl) videoPlayerEl.muted = false;
  }, [setPlayRestricted, toggleMute, videoPlayerEl]);

  useEffect(() => {
    // in case if video player was not loaded at time of backdrop click
    // this will re run and unmute when video player was loaded
    if (videoPlayerEl?.muted && !isMuted) {
      videoPlayerEl.muted = false;
    }
  }, [isMuted, videoPlayerEl]);

  return (
    <Backdrop
      className="cursor"
      closeOnEscPress={false}
      onClose={handleAcknowledgement}
      isOpen={isOpen}
    >
      <div
        className="column full-height flex-c light p-10"
        data-cy="meetings-auto-play-backdrop"
      >
        <Icon className="h1 m-b-10" name="volume-off" />
        <div className="h4 no-mgn-b">
          Click to unmute
        </div>
      </div>
    </Backdrop>
  );
}

export default AutoplayFixBackdrop;
