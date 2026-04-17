class MediaCodecError extends Error {
  constructor(codec) {
    super('Unsupported codec');
    this._codec = codec;
  }

  get codec() {
    return this._codec;
  }
}

export default MediaCodecError;
