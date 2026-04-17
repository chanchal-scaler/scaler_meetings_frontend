import { ensureArray } from '@common/utils/array';
import { parsePlugins } from '~analytics/utils/parsePlugins';
import ACTIONS from '~analytics/store/actions';
import store from '~analytics/store';

class Plugins {
  constructor(_plugins, app) {
    const {
      pluginsArray,
      plugins,
      pluginEnabled,
    } = parsePlugins(_plugins);
    this._pluginEnabled = pluginEnabled;
    this._allPlugins = plugins;
    this._pluginsArray = pluginsArray;
    this._app = app;
  }

  /**
   * Enable analytics plugin
   * @param  {string|string[]} plugins - name of plugins(s) to enable
   * @param  {Function} [callback] - callback after enable runs
   * @returns {Promise}
   * @example
   *
   * analytics.plugins.enable('google-analytics').then(() => {
   *   console.log('do stuff')
   * })
   *
   * // Enable multiple plugins at once
   * analytics.plugins.enable(['google-analytics', 'mixpanel']).then(() => {
   *   console.log('do stuff')
   * })
   */
  // eslint-disable-next-line class-methods-use-this
  enable(pluginsToEnable, callback) {
    return new Promise((resolve) => {
      store.dispatch({
        type: ACTIONS.enablePlugin,
        plugins: ensureArray(pluginsToEnable),
        app: this.app,
      }, resolve, [callback]);
    });
  }

  /**
   * Disable analytics plugin
   * @typedef {Function} DisablePlugin
   * @param  {string|string[]} plugins - name of integration(s) to disable
   * @param  {Function} callback - callback after disable runs
   * @returns {Promise}
   * @example
   *
   * analytics.plugins.disable('mixpanel').then(() => {
   *   console.log('do stuff')
   * })
   *
   * analytics.plugins.disable(['mixpanel', 'google-analytics']).then(() => {
   *   console.log('do stuff')
   * })
   */
  // eslint-disable-next-line class-methods-use-this
  disable(pluginsToDisable, callback) {
    return new Promise((resolve) => {
      store.dispatch({
        type: ACTIONS.disablePlugin,
        plugins: ensureArray(pluginsToDisable),
        app: this.app,
        _: { originalAction: ACTIONS.disablePlugin },
      }, resolve, [callback]);
    });
  }

  get pluginEnabled() {
    return this._pluginEnabled;
  }

  get allPlugins() {
    return this._allPlugins;
  }

  get app() {
    return this._app;
  }

  get pluginsArray() {
    return this._pluginsArray;
  }
}

export default Plugins;
