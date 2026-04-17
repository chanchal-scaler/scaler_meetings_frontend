function createMessage(methodName) {
  return `The method \`${methodName}\` is not implemented`;
}

class NotImplementedError extends Error {
  constructor(methodName) {
    super(createMessage(methodName));

    this._methodName = methodName;
  }

  get methodName() {
    return this._methodName;
  }
}

export default NotImplementedError;
