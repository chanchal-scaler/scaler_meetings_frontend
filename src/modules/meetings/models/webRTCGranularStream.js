import { flow } from 'mobx';

import { VideoStreamPlaybackStates } from '~meetings/utils/stream';
import WebRTCStream from './webRTCStream';

class WebRTCGranularStream extends WebRTCStream {
  isStarting = {
    audio: false,
    video: false,
  }

  play = flow(function* ({ mediaType, elementId }) {
    if (this.isStarting[mediaType]) return;

    this.isStarting[mediaType] = true;
    if (mediaType === 'audio') yield this.checkAutoPlayAccess();

    try {
      yield this._stream.play({ mediaType, elementId });
      this.setPlaybackState(mediaType, VideoStreamPlaybackStates.playing);
    } catch (error) {
      this.setPlaybackState(mediaType, VideoStreamPlaybackStates.failed);
    }

    this.isStarting[mediaType] = false;
  });

  async stop({ mediaType }) {
    await this._stream.stop({ mediaType });
    this.setPlaybackState(mediaType, VideoStreamPlaybackStates.paused);
  }

  destroy() {
    this._stream.destroy();
  }

  resume = flow(function* () {
    if (this.isStarting.audio) return;

    this.isStarting.audio = true;

    try {
      yield this._stream.play({ mediaType: 'audio' });
      this.setPlaybackState('audio', VideoStreamPlaybackStates.playing);
    } catch (error) {
      // Ignore
    }

    this.isStarting.audio = false;
  });

  setAudioOutputDevice(deviceId) {
    this._stream.setAudioOutputDevice(deviceId);
  }
}

export default WebRTCGranularStream;
