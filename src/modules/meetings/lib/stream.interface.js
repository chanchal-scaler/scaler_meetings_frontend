/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { NotImplementedError } from '@common/errors';
import EventEmitter from '@common/lib/eventEmitter';

class StreamInterface extends EventEmitter {
  constructor(videoBroadcasting, nativeStream, mode) {
    super();

    this._videoBroadcasting = videoBroadcasting;
    this._nativeStream = nativeStream;
    this._mode = mode;
  }

  // Public exposed methods

  async initialise() {
    throw new NotImplementedError('initialise');
  }

  async destroy() {
    throw new NotImplementedError('destroy');
  }

  async getStats() {
    throw new NotImplementedError('getStats');
  }

  // Public readable properties

  get id() {
    throw new NotImplementedError('id');
  }

  get isPreRecorded() {
    throw new NotImplementedError('isPreRecorded');
  }

  get isRemote() {
    throw new NotImplementedError('isRemote');
  }

  get isAudioMuted() {
    throw new NotImplementedError('isAudioMuted');
  }

  get isVideoMuted() {
    throw new NotImplementedError('isVideoMuted');
  }

  get mode() {
    return this._mode;
  }

  get type() {
    throw new NotImplementedError('type');
  }

  get userId() {
    throw new NotImplementedError('userId');
  }
}

export default StreamInterface;
