/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { NotImplementedError } from '@common/errors';
import { STREAMING_MODES } from '~meetings/utils/stream';
import StreamInterface from './stream.interface';

class GranularStreamInterface extends StreamInterface {
  constructor(videoBroadcasting, nativeStream) {
    super(videoBroadcasting, nativeStream, STREAMING_MODES.granular);
  }

  // async subscribe({ mediaType }) {
  //   throw new NotImplementedError('subscribe');
  // }

  // async unsubscribe({ mediaType }) {
  //   throw new NotImplementedError('unsubscribe');
  // }

  async play({ elementId, mediaType }) {
    throw new NotImplementedError('play');
  }

  stop({ mediaType }) {
    throw new NotImplementedError('stop');
  }

  setAudioOutputDevice(deviceId) {
    throw new NotImplementedError('setAudioOutputDevice');
  }
}

export default GranularStreamInterface;
