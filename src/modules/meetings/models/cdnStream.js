import {
  action, computed, flow, makeObservable, observable, runInAction,
} from 'mobx';
import camelCase from 'lodash/camelCase';
import Hls from 'hls.js';

import { createDomElement } from '@common/utils/dom';
import { isHlsSource } from '~video_player/utils/hls';
import { log } from '@common/utils/debug';
import { logEvent } from '@common/utils/logger';
import { MediaTimingSrc } from '~meetings/lib/timing/srcs';
import { normalize } from '@common/utils/number';
import {
  StreamContentTypes,
  VideoStreamPlaybackStates,
} from '~meetings/utils/stream';
import { TimingSyncAlgorithms } from '~meetings/lib/timing/srcs/base';
import MediaUtil from '@common/lib/mediaUtil';
import VideoStream from './videoStream';

const videoEvents = [
  'canplay', 'ended', 'error', 'pause', 'play', 'playing', 'stalled', 'suspend',
  'timeupdate', 'waiting',
];

const METADATA_TIMEOUT = 20000; // In ms

const NEAR_END_LIMIT = 2; // In sec

class CDNStream extends VideoStream {
  static contentType = StreamContentTypes.cdn;

  _playerEl = null;

  _videoEl = null;

  isEnded = false;

  isBuffering = true;

  /**
   * We mark CDN stream ready 500ms after it is played and only show the video
   * when it is marked ready.
   * Reason for this is if a user joins while CDN stream is playing he sees a
   * initial flicker from first frame of the video to the current frame
   */
  isReady = false;

  _hls = null;

  constructor(channel, id, data, session) {
    super(
      channel,
      id,
      data.userId,
      {
        audio: false,
        video: false,
      },
      data.type,
    );
    this.url = data.cdnUrl;
    this._session = session;
    this.volumeLevel = 0;
    // Hidden by default only made visible when status is playing
    this.isActive = false;
    this.load();
    makeObservable(this, {
      isBuffering: observable,
      isEnded: observable,
      isReady: observable,
      isConnectionPaused: computed,
      secondaryRank: computed,
      setBuffering: action,
      setEnded: action,
      setVideoDisabled: action,
      resume: action,
    });
  }

  load = flow(function* () {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    this.loadError = null;
    this.newLoadAttempt();

    try {
      if (isHlsSource(this.url)) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          yield new Promise((resolve, reject) => {
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              hls.destroy();
              resolve();
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                hls.destroy();
                reject(new Error('Failed to load HLS manifest'));
              }
            });

            hls.loadSource(this.url);
          });
        } else {
          throw new Error('HLS playback not supported');
        }
      } else {
        // For MP4 and other direct video sources
        const mediaUtil = new MediaUtil(this.url);
        yield mediaUtil.loadMetaData({ timeout: METADATA_TIMEOUT });
        mediaUtil.destroy();
      }

      this.session.markStreamLoaded(this.id);
      this.isLoaded = true;
      this.resetLoadAttempts();
    } catch (error) {
      this.loadError = error;
      this.session.markStreamFailed(this.id);
      logEvent('error', 'StreamError: Failed to initialize stream', error);
    }

    this.isLoading = false;
  });

  play = flow(function* (id) {
    if (this._playerEl) {
      logEvent(
        'info',
        'CDNStream play called multiple times. Use resume() if trying to '
        + 'resume playback',
      );
      return;
    }

    if (this.isStarting) return;

    this.isStarting = true;
    this.isReady = false;
    yield this.checkAutoPlayAccess();

    const playerEl = this._injectVideoElement({ containerId: id });
    const videoEl = playerEl.querySelector('video');
    this._addEventListeners(videoEl);
    this._timingSrc = new MediaTimingSrc(videoEl, this.timingObject, {
      syncAlgorithm: TimingSyncAlgorithms.gradual,
    });

    try {
      this._videoEl = videoEl;
      this._playerEl = playerEl;
      if (!this.isConnectionPaused) {
        this._timingSrc.connect();
        yield videoEl.play();
      } else {
        // If connection is paused, we dont want new stream's frame to be shown
        // isBuffering get sets to false when timing source is connected again
        this.isBuffering = true;
      }
    } catch (error) {
      logEvent(
        'error',
        'StreamError: Failed to play stream',
        { error, id: this.id },
      );
    }

    this._markAsReady();
    this.isStarting = false;
  });

  stop() {
    if (this._timingSrc) {
      this._timingSrc.disconnect();
      this._timingSrc = null;
    }

    if (this._playerEl) {
      this._playerEl.remove();
      this._playerEl = null;
      this._videoEl = null;
    }
  }

  resume() {
    if (this._videoEl && !this.isConnectionPaused) {
      this._videoEl.play();
      this.isAutoPlayRestricted = false;
      this._videoEl.muted = this.isAutoPlayRestricted;
      this.setBothPlaybackStates(VideoStreamPlaybackStates.playing);
    }
  }

  destroy() {
    if (this._hls) {
      this._hls.destroy();
      this._hls = null;
    }
    this.stop();
  }

  toJSON() {
    return {
      participant: this.participant.toJSON(),
      stream: {
        id: this.id,
        type: this.type,
      },
    };
  }

  setBuffering(isBuffering) {
    this.isBuffering = isBuffering;
  }

  setEnded(isEnded) {
    this.isEnded = isEnded;

    if (isEnded) {
      this.session.markStreamEnded(this.id);
    }
  }

  setVideoDisabled(mode) {
    if (!this._videoEl) return;

    const isDisabled = Boolean(mode);
    this.videoDisableMode = mode;
    if (isDisabled) {
      this._videoEl.style.display = 'none';
    } else {
      this._videoEl.style.display = 'block';
    }
  }

  get isConnectionPaused() {
    return this.session && this.session._isConnectionPaused;
  }

  get isNearEnd() {
    if (this._videoEl) {
      const remaining = (
        this.timingProvider.endPosition - this._videoEl.currentTime
      );
      return remaining < NEAR_END_LIMIT;
    } else {
      return false;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get isRemote() {
    return true;
  }

  get secondaryRank() {
    // Show the stream on top if loading fails so that user is aware to
    // click retry
    if (this.loadError) {
      return 1;
    } else if (this.isEnded) {
      return 0;
    } else if (this.isScreenShare && this.isVideoPlaying) {
      return 0;
    } else {
      return normalize(this.volumeLevel, { min: 0, max: 100 });
    }
  }

  get session() {
    return this._session;
  }

  get sessionId() {
    return this.session.id;
  }

  get timingObject() {
    return this.session.timingObject;
  }

  get timingProvider() {
    return this.session.timingProvider;
  }

  /* Event handlers */

  _handleCanplay = () => {
    this.setBuffering(false);
  }

  _handleEnded = () => {
    log('Stream event ended', this.id);

    if (this._isEndFired) return;

    this._isEndFired = true;
    this.setEnded(true);
  }

  _handleError = () => {
    log('Stream event error', this.id);
    this.setBothPlaybackStates(VideoStreamPlaybackStates.failed);
  }

  _handlePause = () => {
    this.setVolume(0);
    this.setMuted('audio', true);
    this.setBothPlaybackStates(VideoStreamPlaybackStates.paused);
  }

  _handlePlay = () => {
    this.setVolume(100);
    // prevent overwriting error set by can autoplay
    this.setPlaybackState('video', VideoStreamPlaybackStates.playing);
    this.setMuted('audio', false);
  }

  _handlePlaying = () => {
    this.setBuffering(false);
  }

  _handleTimeupdate = () => {
    if (this._isEndFired) return;

    if (this.isNearEnd) {
      this._isEndFired = true;
      setTimeout(() => {
        this.setEnded(true);
      }, NEAR_END_LIMIT * 1000);
    }
  }

  _handleWaiting = () => {
    this.setBuffering(true);
    this.meeting.track('cdn-stream-buffered');
  }

  // Private

  _addEventListeners(videoEl) {
    this._removeEventListeners(videoEl);

    videoEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      videoEl.addEventListener(eventName, this[`_${handlerFnName}`]);
    });
  }

  _removeEventListeners(videoEl) {
    videoEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      videoEl.removeEventListener(eventName, this[`_${handlerFnName}`]);
    });
  }

  _injectVideoElement({ containerId }) {
    const attributes = {
      id: this._videoElementId,
      class: 'cdn-video__player',
      playsinline: true,
      muted: this.isAutoPlayRestricted,
    };

    // Only set src for non-HLS sources
    if (!isHlsSource(this.url)) {
      attributes.src = this.url;
    }

    const videoEl = createDomElement('video', {
      attributes,
    });

    const playerEl = createDomElement('div', {
      attributes: {
        id: this._playerElementId,
        class: 'cdn-video__container',
      },
      styles: {
        display: this.isVideoDisabled ? 'none' : 'block',
      },
    });
    playerEl.appendChild(videoEl);

    const streamDivEl = document.getElementById(containerId);
    if (streamDivEl) {
      streamDivEl.appendChild(playerEl);
    }

    // Setup HLS if needed
    if (isHlsSource(this.url) && Hls.isSupported()) {
      this._setupHls(videoEl);
    }

    return playerEl;
  }

  _markAsReady() {
    setTimeout(
      () => runInAction(() => { this.isReady = true; }),
      500,
    );
  }

  get _playerElementId() {
    return `player_${this.id}`;
  }

  get _videoElementId() {
    return `video${this.id}`;
  }

  _setupHls(videoEl) {
    if (this._hls) {
      this._hls.destroy();
    }

    this._hls = new Hls({
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      fragLoadPolicy: {
        default: {
          maxLoadTimeMs: 60000,
          maxTimeToFirstByteMs: 60000,
          errorRetry: {
            maxNumRetry: 6,
            retryDelayMs: 1000,
            maxRetryDelayMs: 8000,
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

    this._hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        logEvent(
          'error',
          'StreamError: HLS playback error',
          { error: data, id: this.id },
        );
        this.setBothPlaybackStates(VideoStreamPlaybackStates.failed);
      }
    });

    this._hls.loadSource(this.url);
    this._hls.attachMedia(videoEl);
  }

  disconnectTimingSource() {
    if (this._timingSrc) {
      this._timingSrc.disconnect();
      logEvent(
        'info',
        'CDNStream: Disconnected from timing source',
        { streamId: this.id },
      );
    }
  }

  reconnectTimingSource() {
    if (this._timingSrc) {
      this._timingSrc.connect();
      logEvent(
        'info',
        'CDNStream: Reconnected to timing source',
        { streamId: this.id },
      );
    }
  }
}

export default CDNStream;
