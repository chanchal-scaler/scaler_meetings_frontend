const messagesMap = {
  INVALID_SERVICE_PROVIDER: 'The requested connection provider does not exist!',
  SERVICE_PROVIDER_TIMEOUT: 'The requested connection provider '
    + 'is not available!',
};

class ServiceProviderError extends Error {
  constructor(code, provider) {
    super(messagesMap[code]);

    this._code = code;
    this._provider = provider;
  }

  get code() {
    return this._code;
  }

  get provider() {
    return this._provider;
  }
}

export default ServiceProviderError;
