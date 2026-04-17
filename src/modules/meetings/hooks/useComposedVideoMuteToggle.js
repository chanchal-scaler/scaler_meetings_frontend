import { useEffect } from 'react';
import { useFirstRender } from '@common/hooks';

// known issue : when host re-joins with unmute and video card playing,
// it will mute it. Just if in case localAvStream isn't set up, due to network
// or any issue, audio and video will remain unmuted.

function useComposedVideoMuteToggle(meeting) {
  const { playlist, videoBroadcasting } = meeting;
  const { isComposedVideoPlaying } = playlist;
  const isFirstRender = useFirstRender();

  useEffect(() => {
    if (!videoBroadcasting) return;

    // If host joins in muted state and there is no video card playing in the
    // meeting then the host should remain muted. Below condition ensures that.
    if (isFirstRender && !isComposedVideoPlaying) return;
    videoBroadcasting.setMuteForAllStreams(Boolean(isComposedVideoPlaying));
  }, [isComposedVideoPlaying, isFirstRender, videoBroadcasting]);
}

export default useComposedVideoMuteToggle;
