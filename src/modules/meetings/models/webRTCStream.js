import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';

import { logEvent } from '@common/utils/logger';
import { normalize } from '@common/utils/number';
import { NotImplementedError } from '@common/errors';
import {
  StreamContentTypes,
  VideoStreamPlaybackStates,
} from '~meetings/utils/stream';
import AudioNotification from '@common/lib/audioNotification';
import VideoStream from './videoStream';

const pingNotification = new AudioNotification('ping');

class WebRTCStream extends VideoStream {
  static contentType = StreamContentTypes.webrtc;

  stats = null;

  /**
   * If `true` indicates that the stream has falled back to audio only
   * due to poor network conditions.
   *
   * Only valid for remote streams.
   */
  isAudioFallback = false;

  constructor(channel, stream) {
    super(
      channel, stream.id, stream.userId,
      { audio: stream.isAudioMuted, video: stream.isVideoMuted },
      stream.type,
    );
    this._isRemote = stream.isRemote;
    this._isPreRecorded = stream.isPreRecorded;
    this._stream = stream;

    // Prerecorded streams are in active by default mark them active only when
    // server indicates that it is active
    if (stream.isPreRecorded) {
      this.isActive = false;
    }

    if (stream.isRemote && !stream.isPreRecorded) {
      pingNotification.play();
    }

    this.load();
    makeObservable(this, {
      isActiveScreenShare: computed,
      isAudioFallback: observable,
      isStalled: computed,
      isRemote: computed,
      secondaryRank: computed,
      setAudioFallback: action.bound,
      setVideoDisabled: action.bound,
      stats: observable.ref,
    });
  }

  load = flow(function* () {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    this.loadError = null;
    this.newLoadAttempt();

    try {
      yield this._stream.initialise();
      this.isLoaded = true;
      this.resetLoadAttempts();
    } catch (error) {
      this.loadError = error;
      logEvent('error', 'StreamError: Failed to initialize stream', error);
    }

    this.isLoading = false;
  });

  // eslint-disable-next-line class-methods-use-this
  play() {
    throw NotImplementedError('play');
  }

  // eslint-disable-next-line class-methods-use-this
  stop() {
    throw NotImplementedError('stop');
  }


  // eslint-disable-next-line class-methods-use-this
  destroy() {
    throw NotImplementedError();
  }

  /**
   * Logs stats. Used for debugging and development purposes only
   */
  loadStats = flow(function* () {
    try {
      const stats = yield this._stream.getStats();
      if (this.isVideoMuted) {
        stats.width = 0;
        stats.height = 0;
      }
      this.stats = stats;
    } catch (error) {
      logEvent(
        'error',
        'StreamError: Failed to fetch stream stats',
        { error, id: this.id },
      );
    }
  });

  // eslint-disable-next-line class-methods-use-this
  resume() {
    throw NotImplementedError('resume');
  }

  setAudioFallback(isFallback) {
    this.isAudioFallback = isFallback;
  }

  setVideoDisabled(mode) {
    const isDisabled = Boolean(mode);
    // If there is no change in the way video is rendered due to this update
    // ignore it
    if (isDisabled === this.isVideoDisabled) {
      return;
    }

    this.videoDisableMode = mode;
  }

  toJSON() {
    return {
      participant: this.participant.toJSON(),
      stream: {
        id: this.id,
        type: this.type,
        remote: this.isRemote,
      },
    };
  }

  get id() {
    return this._id;
  }

  get isActiveScreenShare() {
    return (
      this.isScreenShare
      && this.userId === this.manager.activeScreenUserId
    );
  }

  get isLocalScreenShare() {
    return this.isScreenShare && !this.isRemote;
  }

  get isPreRecorded() {
    return this._isPreRecorded;
  }

  get isRemote() {
    return this._isRemote;
  }

  /**
   * Indicates if stream has been muted by the browser due to autoplay policy.
   */
  get isStalled() {
    return (
      this.isRemote
      && this.audioState === VideoStreamPlaybackStates.stalled
    );
  }

  get mode() {
    return this._stream.mode;
  }

  get secondaryRank() {
    if (this.isScreenShare) {
      if (this.isPreRecorded) {
        return 1;
      } else if (this.isActiveScreenShare) {
        return 0.5;
      } else {
        return 0;
      }
    } else if (!this.isRemote) {
      // Local streams should be rendered in the end
      return 0;
    } else if (this.isAudioMuted) {
      // If audio muted then render right above local streams
      return 0.01;
    } else if (this.isPreRecorded) {
      // If pre recorded then render above all av streams
      return 1;
    } else {
      // If none match then render based on volume level
      return normalize(
        this.volumeLevel,
        { min: 0, max: 100 },
        { min: 0.1, max: 0.9 },
      );
    }
  }
}

export default WebRTCStream;
