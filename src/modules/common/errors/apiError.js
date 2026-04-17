class ApiError extends Error {
  constructor(message, underlying) {
    super(message);

    this._underlyingError = underlying;
  }

  get isValid() {
    return this.underlying.isFromServer;
  }

  get status() {
    if (this.isValid) {
      return this.underlying.response.status;
    } else {
      return -1;
    }
  }

  get underlying() {
    return this._underlyingError;
  }
}

export default ApiError;
