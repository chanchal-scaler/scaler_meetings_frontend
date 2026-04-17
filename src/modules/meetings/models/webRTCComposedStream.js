import { flow, reaction } from 'mobx';
import camelCase from 'lodash/camelCase';

import { VideoStreamPlaybackStates } from '~meetings/utils/stream';
import STREAM_EVENTS from '~meetings/lib/stream.events';
import WebRTCStream from './webRTCStream';

const MAX_RETRIES = 2;

// Retry every 2 seconds in case of playback failure
const RETRY_INTERVAL = 2000; // In ms

const streamEvents = [STREAM_EVENTS.playbackStatusChange];

class WebRTCComposedStream extends WebRTCStream {
  _retryCount = 0;

  constructor(channel, stream) {
    super(channel, stream);

    this._addEventListeners();
  }

  play = flow(function* (id) {
    if (this.isStarting) return;

    this.isStarting = true;
    this._setupRetryReaction();
    yield this.checkAutoPlayAccess();

    try {
      yield this._stream.play(id);
    } catch (error) {
      // Do nothing
    }

    // The play method won't throw any error if playback fails rather it emits
    // an event indicating playback failed. In such cases we to retry to play
    // the stream once again.
    this._retryIfRecoverableError();
    this.isStarting = false;
  });

  stop() {
    if (this._retryReaction) {
      this._retryReaction();
    }
    clearTimeout(this._retryTimeout);
    this._stream.stop();
  }

  destroy() {
    this.stop();
    this._stream.destroy();
    this._removeEventListeners();
  }

  resume = flow(function* () {
    if (this.isStarting) return;

    this.isStarting = true;
    this.isAutoPlayRestricted = false;

    try {
      yield this._stream.resume();
    } catch (error) {
      // Ignore
    }

    this.isStarting = false;
  });

  setVideoDisabled(mode) {
    super.setVideoDisabled(mode);
    const isDisabled = Boolean(mode);
    this.toggleVideo(isDisabled);
  }

  toggleVideo(isDisabled) {
    this._stream.toggleVideo(isDisabled);
  }


  /* Private */

  _addEventListeners() {
    streamEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this._stream.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _removeEventListeners() {
    streamEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this._stream.off(eventName, this[`_${handlerFnName}`]);
    });
  }

  _handlePlaybackStatusChange = ({ type, state }) => {
    const newState = this.setPlaybackState(type, state);

    // In case of windows video might get paused when there are frequent
    // DOM manipulations below code detects it and resumes the playback
    if (this.isRemote && state === VideoStreamPlaybackStates.paused) {
      this.resume();
    }

    // Reset retry count when there is no error with playback
    if (!this.hasPlaybackError) {
      this._retryCount = 0;
    }

    this.meeting.track(`stream-${type}-${newState}`, 'log');
  }

  _setupRetryReaction() {
    this._retryReaction = reaction(() => ({
      audioState: this.audioState,
      videoState: this.videoState,
    }), this._retryIfRecoverableError);
  }

  _retryIfRecoverableError = () => {
    if (this.hasPlaybackError && this._retryCount < MAX_RETRIES) {
      clearTimeout(this._retryTimeout);
      this._retryTimeout = setTimeout(() => {
        if (!this.hasPlaybackError) {
          return;
        }

        this.resume();
        this._retryCount += 1;
      }, RETRY_INTERVAL);
    }
  }
}

export default WebRTCComposedStream;
