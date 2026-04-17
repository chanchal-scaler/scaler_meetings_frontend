export const StreamContentTypes = {
  webrtc: 'webrtc',
  cdn: 'cdn',
};

export const StreamPrimaryRanks = {
  default: 1,
  /**
   * Useful for screenshares, ppts etc.
   */
  presentation: 2,
  /**
   * Useful for streams with users can interact in realtime like whiteboard,
   * code editor etc.
   */
  interactive: 3,
};

export const VideoStreamPlaybackStates = {
  /**
   * Playback not yet started.
   */
  idle: 'idle',
  /**
   * Playback has started and is currently active.
   */
  playing: 'playing',
  /**
   * An expected pause that is occured due some user(can be remote) action.
   */
  paused: 'paused',
  /**
   * An unexpected pause that is occured due to browser restrictions, normally
   * playback can be started by user action.
   */
  stalled: 'stalled',
  /**
   * Playback failed due to some unknown reason. Generally trying to play the
   * stream again should fix this.
   */
  failed: 'failed',
  /**
   * Try to recover a failed playback also fails. Could be network issue.
   */
  unrecoverable: 'unrecoverable',
};

export const videoStreamErrorStates = [
  VideoStreamPlaybackStates.failed,
  VideoStreamPlaybackStates.unrecoverable,
];

export const VideoStreamTypes = {
  av: 'av',
  screen: 'screen',
};

export const STREAMING_MODES = {
  // Both audio and video tracks are streamed as a single entity
  // and there is not much fine grained control. Ex: Agora v3 SDK
  composed: 'composed',
  // Both audio and video tracks are streamed as seperate tracks
  // and there by providing more grained control. Ex: Agora v4 and Dyte SDK
  granular: 'granular',
};

export const STREAM_TRACK_MEDIA_TYPES = {
  audio: 'audio',
  video: 'video',
};
