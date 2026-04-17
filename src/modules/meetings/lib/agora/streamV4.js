/* eslint-disable class-methods-use-this */
import { parseStreamId } from './utils';
import {
  STREAM_TRACK_MEDIA_TYPES,
  VideoStreamTypes,
} from '~meetings/utils/stream';
import GranularStreamInterface from '../granularStream.interface';

const VIDEO_PLAYBACK_CONFIG = {
  fit: 'contain',
};

class AgoraStream extends GranularStreamInterface {
  constructor(videoBroadcasting, nativeStream, isRemote = true) {
    super(videoBroadcasting, nativeStream);

    this._id = nativeStream.uid;
    [
      this._type,
      this._userId,
      this._isPreRecorded,
    ] = parseStreamId(this._id);
    this._isRemote = isRemote;
    this._hasVideo = this._nativeStream.hasVideo;
    this._hasAudio = this._nativeStream.hasAudio;
  }

  // eslint-disable-next-line class-methods-use-this
  async initialise() {
    // Do nothing
  }

  async play({ elementId, mediaType }) {
    if (this.isRemote) {
      await this._client.subscribe(this._nativeStream, mediaType);
      if (mediaType === STREAM_TRACK_MEDIA_TYPES.video) {
        this._videoTrack.play(elementId, VIDEO_PLAYBACK_CONFIG);
      }
      if (mediaType === STREAM_TRACK_MEDIA_TYPES.audio) {
        this._audioTrack.play();
      }
    } else {
      // We do not play local audio or screen streams
      if (
        mediaType === STREAM_TRACK_MEDIA_TYPES.audio
        || this.type === VideoStreamTypes.screen
      ) {
        return;
      }

      this._videoTrack.play(elementId, VIDEO_PLAYBACK_CONFIG);
    }
  }

  async stop({ mediaType }) {
    const mediaTrack = this._getMediaTrack(mediaType);

    if (!mediaTrack || !mediaTrack.isPlaying) return;

    mediaTrack.stop();
    if (this.isRemote) {
      await this._client.unsubscribe(this._nativeStream, mediaType);
    }
  }

  async destroy() {
    await this.stop({ mediaType: STREAM_TRACK_MEDIA_TYPES.audio });
    await this.stop({ mediaType: STREAM_TRACK_MEDIA_TYPES.video });

    if (!this.isRemote) {
      if (this._audioTrack) this._audioTrack.close();

      if (this._videoTrack) this._videoTrack.close();
    }
  }

  setAudioOutputDevice(deviceId) {
    if (this.isRemote && this._audioTrack) {
      this._audioTrack.setPlaybackDevice(deviceId);
    }
  }

  getStats() {
    return new Promise(resolve => {
      if (!this._videoTrack) {
        resolve({
          frameRate: 0,
          height: 0,
          width: 0,
        });
      } else if (this.isRemote) {
        const stats = this._videoTrack.getStats();
        resolve({
          frameRate: stats.receiveFrameRate,
          height: stats.receiveResolutionHeight,
          width: stats.receiveResolutionWidth,
        });
      } else {
        const stats = this._videoTrack.getStats();
        resolve({
          frameRate: stats.sendFrameRate,
          height: stats.sendResolutionHeight,
          width: stats.sendResolutionWidth,
        });
      }
    });
  }

  // Public getters

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
    return !this._hasAudio;
  }

  get isVideoMuted() {
    return !this._hasVideo;
  }

  get type() {
    return this._type;
  }

  get userId() {
    return this._userId;
  }

  // Private methods

  _getMediaTrack(mediaType) {
    if (mediaType === STREAM_TRACK_MEDIA_TYPES.audio) {
      return this._audioTrack;
    }

    if (mediaType === STREAM_TRACK_MEDIA_TYPES.video) {
      return this._videoTrack;
    }

    return null;
  }

  // Private getters

  get _audioTrack() {
    return this._nativeStream.audioTrack;
  }

  get _client() {
    return this._videoBroadcasting.client;
  }

  get _videoTrack() {
    return this._nativeStream.videoTrack;
  }
}

export default AgoraStream;
