import camelCase from 'lodash/camelCase';

import { parseStreamId } from './utils';
import { VideoStreamPlaybackStates } from '~meetings/utils/stream';
import ComposedStreamInterface from '../composedStream.interface';
import STREAM_EVENTS from '../stream.events';

const streamEvents = ['player-status-change'];

class AgoraStream extends ComposedStreamInterface {
  constructor(videoBroadcasting, nativeStream, isRemote = true) {
    super(videoBroadcasting, nativeStream);

    this._id = nativeStream.getId();
    [
      this._type,
      this._userId,
      this._isPreRecorded,
    ] = parseStreamId(this._id);
    this._isRemote = isRemote;
    this._addEventListeners();
  }

  async initialise() {
    if (this.isRemote) {
      if (this.type !== 'screen' && this._shouldEnableDualStream) {
        this._client.setStreamFallbackOption(this._nativeStream, 2);
      }
      await this._subscribe();
    }
  }

  play(elementId) {
    return new Promise((resolve, reject) => {
      this._nativeStream.play(elementId, { fit: 'contain' }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async resume() {
    await this._nativeStream.resume();
  }

  stop() {
    this._nativeStream.stop();
  }

  destroy() {
    if (this.isRemote) {
      this._client.unsubscribe(this._nativeStream);
    }
    this._nativeStream.close();
  }

  toggleVideo(isDisabled) {
    if (this.isRemote) {
      this._client.subscribe(
        this._nativeStream,
        { video: !isDisabled, audio: true },
      );
    }
  }

  getStats() {
    return new Promise((resolve, reject) => {
      let isRejected = false;

      // Reject if it takes more than 3 seconds
      const timeoutId = setTimeout(() => {
        isRejected = true;
        reject(new Error('Timeout'));
      }, 3000);

      this._nativeStream.getStats((stats) => {
        if (!isRejected) {
          clearTimeout(timeoutId);
          if (this.isRemote) {
            resolve({
              frameRate: stats.videoReceiveFrameRate,
              height: stats.videoReceiveResolutionHeight,
              width: stats.videoReceiveResolutionWidth,
            });
          } else {
            resolve({
              frameRate: stats.videoSendFrameRate,
              height: stats.videoSendResolutionHeight,
              width: stats.videoSendResolutionWidth,
            });
          }
        }
      });
    });
  }

  get id() {
    return this._id;
  }

  get isPreRecorded() {
    return this._isPreRecorded;
  }

  get isRemote() {
    return this._isRemote;
  }

  get isAudioMuted() {
    // For remote streams let the mute state be false by default. If the
    // streams are already muted the mute callbacks get triggered as soon as
    // client subscribes to the streams
    if (this.isRemote) {
      return false;
    } else {
      const audioTrack = this._nativeStream.getAudioTrack();
      return !audioTrack || !audioTrack.enabled;
    }
  }

  get isVideoMuted() {
    // For remote streams let the mute state be false by default. If the
    // streams are already muted the mute callbacks get triggered as soon as
    // client subscribes to the streams
    if (this.isRemote) {
      return false;
    } else {
      const videoTrack = this._nativeStream.getVideoTrack();
      return !videoTrack || !videoTrack.enabled;
    }
  }

  get type() {
    return this._type;
  }

  get userId() {
    return this._userId;
  }

  // Private methods

  _addEventListeners() {
    streamEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this._nativeStream.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _subscribe() {
    return new Promise((resolve, reject) => {
      const onSubscibeSuccess = (event) => {
        this._client.off('stream-subscribed', onSubscibeSuccess);
        resolve(event);
      };

      this._client.on('stream-subscribed', onSubscibeSuccess);

      this._client.subscribe(this._nativeStream, (error) => {
        this._client.off('stream-subscribed', onSubscibeSuccess);
        reject(error);
      });
    });
  }

  // Event handlers

  _handlePlayerStatusChange = (event) => {
    const { reason, mediaType } = event;
    let state;

    switch (reason) {
      case 'playing':
      case 'audioonly':
        state = VideoStreamPlaybackStates.playing;
        break;
      case 'canplay':
      case 'stalled':
      case 'suspend':
        state = VideoStreamPlaybackStates.stalled;
        break;
      case 'pause':
      case 'stop':
        state = VideoStreamPlaybackStates.paused;
        break;
      default:
        state = VideoStreamPlaybackStates.failed;
    }
    this.emit(STREAM_EVENTS.playbackStatusChange, { type: mediaType, state });
  }

  // Private getters

  get _client() {
    return this._videoBroadcasting.client;
  }

  get _shouldEnableDualStream() {
    return Boolean(this._videoBroadcasting.settings.dual_stream_enabled);
  }
}

export default AgoraStream;
