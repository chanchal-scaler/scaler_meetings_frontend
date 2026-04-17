import { logEvent } from '@common/utils/logger';
import { NotImplementedError } from '@common/errors';

class Plugin {
  loaded = false;

  constructor({ name, config }) {
    this._name = name;
    this._config = config;

    const { token } = config;
    if (!token) {
      logEvent(
        'error',
        `AnalyticsModuleError: Token not found for plugin ${name}`,
        config,
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  initialize() {
    throw new NotImplementedError('initialize');
  }

  // eslint-disable-next-line class-methods-use-this
  track() {
    throw new NotImplementedError('track');
  }

  // eslint-disable-next-line class-methods-use-this
  page() {
    throw new NotImplementedError('page');
  }

  // eslint-disable-next-line class-methods-use-this
  identify() {
    throw new NotImplementedError('identify');
  }

  // eslint-disable-next-line class-methods-use-this
  alias() {
    throw new NotImplementedError('alias');
  }

  // eslint-disable-next-line class-methods-use-this
  reset() {
    throw new NotImplementedError('reset');
  }

  get name() {
    return this._name;
  }

  get config() {
    return this._config;
  }
}

export default Plugin;
