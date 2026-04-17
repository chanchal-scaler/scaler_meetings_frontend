/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { NotImplementedError } from '@common/errors';
import { STREAMING_MODES } from '~meetings/utils/stream';
import StreamInterface from './stream.interface';

class ComposedStreamInterface extends StreamInterface {
  constructor(videoBroadcasting, nativeStream) {
    super(videoBroadcasting, nativeStream, STREAMING_MODES.composed);
  }

  // Public exposed methods

  async play(elementId) {
    throw new NotImplementedError('play');
  }

  async resume() {
    throw new NotImplementedError('resume');
  }

  stop() {
    throw new NotImplementedError('stop');
  }

  toggleVideo(isDisabled) {
    throw new NotImplementedError('toggleVideo');
  }
}

export default ComposedStreamInterface;
