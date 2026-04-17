import { useEffect } from 'react';

import { STREAM_TRACK_MEDIA_TYPES } from '~meetings/utils/stream';

function useStreamPlayback({
  stream, elementId, shouldNotPlay, isPlaybackHidden,
}) {
  // This hook handles logic to play audio and video for composed streams.
  useEffect(() => {
    if (!stream.isComposedMode || shouldNotPlay) return () => { };

    /**
     * Works without `setTimeout` hack in all cases except the below case:
     * When host video is docked above chat by doing the following steps
     * the audio is lost without the below hack.
     * 1. Join meeting as audience with atleast one active host.
     * 2. Use the browser's maximise toggle button(the middle button of the 3
     * buttons that any application window has in general) to make the browser
     * go out of fullscreen mode.
     * 3. Make sure that when you are out of fullscreen mode the browser window
     * size is such that it is treated as tablet. If the host video which was
     * docked above chat in the sidebar now comes to the center of the screen
     * then it means that it is being treated tablet.
     * 4. Then go back to fullscreen mode and you should see that the audio is
     * lost.
     *
     * This happens because the stream play and stop sequence gets messed up
     * as this hook is not called in a proper order has the video stream is
     * unmounted from center of the screen and mounted back above the chat in
     * the sidebar.
     */
    setTimeout(() => stream.play(elementId), 200);

    return () => stream.stop();
    // eslint-disable-next-line
  }, []);

  // This hook handles logic to play video for granular streams.
  useEffect(() => {
    if (!stream.isGranularMode || shouldNotPlay) return () => {};

    // If playback is hidden then no need to play video. Just audio needs to be
    // played.
    if (!isPlaybackHidden) {
      setTimeout(
        () => stream.play({
          mediaType: STREAM_TRACK_MEDIA_TYPES.video,
          elementId,
        }),
        200,
      );

      return () => stream.stop({ mediaType: STREAM_TRACK_MEDIA_TYPES.video });
    }

    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId, shouldNotPlay, isPlaybackHidden]);


  // This hook handles logic to play audio for granular streams.
  useEffect(() => {
    if (!stream.isGranularMode || shouldNotPlay) return () => {};

    if (!stream.isAudioMuted) {
      setTimeout(
        () => stream.play({ mediaType: STREAM_TRACK_MEDIA_TYPES.audio }),
        200,
      );

      return () => stream.stop({ mediaType: STREAM_TRACK_MEDIA_TYPES.audio });
    }

    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId, shouldNotPlay, stream.isAudioMuted]);
}

export default useStreamPlayback;
