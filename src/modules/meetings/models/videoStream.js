import {
  action, computed, makeObservable, observable,
} from 'mobx';
import canAutoPlay from 'can-autoplay';
import upperFirst from 'lodash/upperFirst';

import { isWebRTCSupportUnstable } from '~meetings/utils/media';
import { NotImplementedError } from '@common/errors';
import {
  STREAMING_MODES,
  StreamPrimaryRanks,
  videoStreamErrorStates,
  VideoStreamPlaybackStates,
  VideoStreamTypes,
} from '~meetings/utils/stream';
import layoutStore from '~meetings/stores/layoutStore';
import Stream from './stream';

/**
 * Base class for all streams in a meeting that render a video in UI
 *
 * Note: Do not use this class directly
 */
class VideoStream extends Stream {
  /**
   * To indicate the stream renders a video in UI. Should not be changed or
   * overrided
   */
  _isVideoContent = true;

  /**
   * Indicates if a video stream in currently trying to start playing.
   * Use this to make sure to not trigger play multiple times on the same
   * video element as it raises errors (Non breaking)
   */
  isStarting = false;

  audioState = VideoStreamPlaybackStates.idle;

  videoState = VideoStreamPlaybackStates.idle;

  isAudioMuted = false;

  isVideoMuted = false;

  /**
   * iOS Autoplay Policy
   * iOS requires user interaction after a video (with audio tracks)
   * wants to auto play, autoplay on muted videos is allowed. Therefore
   * isAutoPlayRestricted keeps a check on it
   */
  isAutoPlayRestricted = false;

  volumeLevel = 0;

  /**
   * Can be one of the following values.
   * - `manual` - User disabled the video
   * - `network` - Video disabled due to poor network
   * - null - Video is not disabled
   *
   * Only valid for remote streams.
   */
  videoDisableMode = null;


  constructor(channel, id, userId, muted, type) {
    super(channel, id, userId);

    this.isAudioMuted = muted.audio;
    this.isVideoMuted = muted.video;
    this._type = type;
    makeObservable(this, {
      audioState: observable,
      checkAutoPlayAccess: action.bound,
      hasAudioError: computed,
      hasPlaybackError: computed,
      hasVideoError: computed,
      isAudioMuted: observable,
      isAudioPlaying: computed,
      isVideoDisabled: computed,
      isVideoMuted: observable,
      isVideoPlaying: computed,
      label: computed,
      setMuted: action.bound,
      setPlaybackState: action,
      setVolume: action.bound,
      shouldRender: computed,
      isAutoPlayRestricted: observable,
      videoDisableMode: observable,
      videoState: observable,
      volumeLevel: observable,
    });
  }

  /**
   * Implement in extending classes
   *
   * Call this method to inject the video element inside the element with
   * provided id and start playing it
   */
  // eslint-disable-next-line
  play(id) {
    throw NotImplementedError();
  }

  /**
   * Implement in extending classes
   *
   * Call this method to resume playing a injected video. Always call this
   * method after play is called.
   *
   * Will be useful in cases where video starts in a muted state and you need
   * to unmute on response to a user gesture
   */
  // eslint-disable-next-line
  resume() {
    throw NotImplementedError();
  }

  setMuted(type, isMuted) {
    const muteKey = `is${upperFirst(type)}Muted`;
    this[muteKey] = isMuted;
  }

  /**
   * Implement in extending classes
   *
   * This getter determines wheather the video stream is
   * remote stream, i.e. not local screen/webcam share
   */
  // eslint-disable-next-line
  get isRemote() {
    throw NotImplementedError();
  }

  async checkAutoPlayAccess() {
    if (isWebRTCSupportUnstable()) {
      const {
        result: isAutoplayAllowed,
      } = await canAutoPlay.video({ timeout: 100, muted: false, inline: true });

      /* restrict autoplay of not allowed */
      this.isAutoPlayRestricted = !isAutoplayAllowed;
    }
  }

  setPlaybackState(type, state) {
    const stateKey = `${type}State`;
    const isFailedCurrently = videoStreamErrorStates.includes(this[stateKey]);
    const isFailedInUpdate = state === VideoStreamPlaybackStates.failed;
    // If fails multiple times then consider it as unrecoverable failure
    if (isFailedCurrently && isFailedInUpdate) {
      this[stateKey] = VideoStreamPlaybackStates.unrecoverable;
    } else {
      this[stateKey] = state;
    }

    // Returns the state that is just set
    return this[stateKey];
  }

  setBothPlaybackStates(state) {
    this.setPlaybackState('audio', state);
    this.setPlaybackState('video', state);
  }

  setVolume(volume) {
    this.volumeLevel = volume;
  }

  /**
   * Implement in extending classes.
   *
   * Logic to only render audio when specified
   */
  // eslint-disable-next-line
  setVideoDisabled(mode) {
    throw NotImplementedError();
  }

  get hasAudioError() {
    return (
      !this.isAudioMuted
      && videoStreamErrorStates.includes(this.audioState)
    );
  }

  get hasPlaybackError() {
    return (
      this.isRemote
      && (this.hasAudioError || this.hasVideoError)
    );
  }

  get hasVideoError() {
    return (
      !this.isVideoMuted
      && videoStreamErrorStates.includes(this.videoState)
    );
  }

  get isAudioPlaying() {
    return this.audioState === VideoStreamPlaybackStates.playing;
  }

  get isComposedMode() {
    return this.mode === STREAMING_MODES.composed;
  }

  get isGranularMode() {
    return this.mode === STREAMING_MODES.granular;
  }

  get isScreenShare() {
    return this.type === VideoStreamTypes.screen;
  }

  get isVideoContent() {
    return this._isVideoContent;
  }

  get isVideoDisabled() {
    return Boolean(this.videoDisableMode);
  }

  get isVideoPlaying() {
    return this.videoState === VideoStreamPlaybackStates.playing;
  }

  get label() {
    let label = this.participant.name;

    if (this.participant.isCurrentUser) {
      label += ` (You)`;
    }

    if (this.isScreenShare) {
      label += ` (Screen)`;
    }

    return label;
  }

  // eslint-disable-next-line class-methods-use-this
  get mode() {
    return STREAMING_MODES.composed;
  }

  get primaryRank() {
    if (this.isScreenShare) {
      return StreamPrimaryRanks.presentation;
    } else {
      return StreamPrimaryRanks.default;
    }
  }

  get shouldRender() {
    let shouldRender = true;

    /**
     * Filter criteria for recording mode
     * AV
     * - If both audio and video are muted
     *
     * ScreenShare
     * - If Screen Share paused
     */
    if (layoutStore.isRecording) {
    // returns false, if stream is muted and video is disabled
      const shouldRenderAV = !this.isAudioMuted || !this.isVideoMuted;
      // returns false, if stream is screen share, and screen sharing is paused
      const shouldRenderScreenShare = this.isScreenShare && !this.isVideoMuted;
      shouldRender = shouldRenderAV || shouldRenderScreenShare;
    }

    return shouldRender;
  }

  get type() {
    return this._type;
  }
}

export default VideoStream;
