/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { NotImplementedError } from '@common/errors';
import EventEmitter from '@common/lib/eventEmitter';

class _BaseInterface extends EventEmitter {
  constructor(config, channelName, userId, token, options = {}) {
    super();

    this._config = config;
    this._channelName = channelName;
    this._userId = userId;
    this._options = options;
    this._token = token;
    // Set the client instance in subclasses that extent from this
    this._client = null;
  }

  /* Public properties/methods */

  async initialise() {
    throw new NotImplementedError('initialise');
  }

  get config() {
    return this._config;
  }

  get channelName() {
    return this._channelName;
  }

  get client() {
    return this._client;
  }

  get options() {
    return this._options;
  }

  get token() {
    return this._token;
  }

  get userId() {
    return this._userId;
  }
}

export default _BaseInterface;
