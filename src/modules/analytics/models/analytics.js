import { getPersistedUserData } from '~analytics/storage/analyticsStorage';
import { isFunction } from '@common/utils/type';
import { logEvent } from '@common/utils/logger';
import { makeContext } from '~analytics/store/reducers/context';
import { processQueue } from '~analytics/store/reducers/queue';
import { watch } from '@common/utils/network';
import ACTIONS from '~analytics/store/actions';
import Instance from './instance';
import store from '~analytics/store';

const noop = () => {};
const HEART_BEAT_INTERVAL = 3000;
/**
 * Analytics library configuration
 *
 * After the library is initialized with config,
 * the core API is exposed & ready for use in the application.
 *
 * @param {object} config - analytics core config
 * @param {string} [config.app] - Name of site / app
 * @param {Array}  [config.plugins] - Array of analytics plugins
 * @return {AnalyticsInstance} Analytics Instance
 */
class Analytics extends Instance {
  constructor(config = {}, callback = noop) {
    super(config);
    this._registerServices(callback);
  }

  /**
   * PRIVATE METHODS
   */
  async _registerServices(callback) {
    try {
      await this._bootstrapPlugins();
      this._registerPlugins();
      this._initializePlugins();
      this._registerNetworkWatchers();
      this._registerHeartbeat();
      if (isFunction(callback)) {
        callback(this);
      }
    } catch (error) {
      logEvent(
        'error',
        'AnalyticsModuleError: Failed to register',
        error,
      );
    }
  }

  async _bootstrapPlugins() {
    const pluginKeys = Object.keys(this.plugins.allPlugins);
    const initialConfig = makeContext(this.config);
    const { initialUser } = this.config.initialUser || {};
    const persistedUser = await getPersistedUserData();
    const userInfo = {
      ...persistedUser,
      ...initialUser,
    };
    /* Bootstrap analytic plugins */
    store.dispatch({
      type: ACTIONS.bootstrap,
      plugins: pluginKeys,
      config: initialConfig,
      user: userInfo,
      initialUser,
      persistedUser,
      app: this.app,
      instance: this,
    });
  }

  _registerPlugins() {
    const pluginKeys = Object.keys(this.plugins.allPlugins);
    /* Register analytic plugins */
    store.dispatch({
      type: ACTIONS.registerPlugins,
      plugins: pluginKeys,
      enabled: this.plugins.pluginEnabled,
      app: this.app,
      instance: this,
    });
    /* dispatch register for individual plugins */
    this.plugins.pluginsArray.forEach((plugin) => {
      const { bootstrap, config: pluginConfig, name } = plugin;
      if (bootstrap && isFunction(bootstrap)) {
        bootstrap({ instance: this, config: pluginConfig, payload: plugin });
      }
      /* Register plugins */
      store.dispatch({
        type: ACTIONS.registerPluginType(name),
        name,
        enabled: this.plugins.pluginEnabled[name],
        plugin,
        app: this.app,
        instance: this,
      });
    });
  }

  _initializePlugins() {
    const pluginKeys = Object.keys(this.plugins.allPlugins);
    const enabledPlugins = pluginKeys.filter(
      (_name) => this.plugins.pluginEnabled[_name],
    );
    const disabledPlugins = pluginKeys.filter(
      (_name) => !this.plugins.pluginEnabled[_name],
    );
    /* Register analytic plugins */
    store.dispatch({
      type: ACTIONS.initialize,
      plugins: enabledPlugins,
      disabled: disabledPlugins,
      allPlugins: this.plugins.allPlugins,
      app: this.app,
      instance: this,
    });
    /* dispatch register for individual plugins */
    this.plugins.pluginsArray.forEach((plugin) => {
      const { name } = plugin;
      if (plugin.initialize && isFunction(plugin.initialize)) {
        plugin.initialize();
      }
      /* Register plugins */
      store.dispatch({
        type: ACTIONS.initializeType(name),
        name,
        enabled: this.plugins.pluginEnabled[name],
        plugin,
        app: this.app,
        instance: this,
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  _registerNetworkWatchers() {
  /* Watch for network events */
    watch((offline) => {
      store.dispatch({
        type: (offline) ? ACTIONS.offline : ACTIONS.online,
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  _registerHeartbeat() {
    clearInterval(this._heartbeatInterval);
    /* Heartbeat retries queued events */
    this._heartbeatInterval = setInterval(() => {
      processQueue(store, this);
    }, HEART_BEAT_INTERVAL);
  }
}

export default Analytics;
