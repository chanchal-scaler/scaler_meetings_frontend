import get from 'lodash/get';

import {
  analyticsStorage, getPersistedUserData,
} from '~analytics/storage/analyticsStorage';
import { ANALYTICS_ACTION_TYPES } from '~analytics/utils/actions';
import { DEFINED_USER_TRAITS } from '~analytics/utils/constants';
import { getPageData } from '~analytics/utils/page';
import { isObject, isString } from '@common/utils/type';
import { logEvent } from '@common/utils/logger';
import { tempKey } from '~analytics/utils/storage';
import ACTIONS, { isReservedAction } from '~analytics/store/actions';
import Plugins from './plugins';
import store from '~analytics/store';
import Storage from './storage';

/**
 * Analytic instance returned from initialization
 * @property {Identify} identify - Identify a user
 * @property {Track} track - Track an analytics event
 * @property {Page} page - Trigger page view
 * @property {User} user - Get user data
 * @property {Reset} reset - Clear information about user & reset analytics
 * @property {Ready} ready - Fire callback on analytics ready event
 * @property {On} on - Fire callback on analytics lifecycle events.
 * @property {Once} once - Fire callback on analytics lifecycle events once.
 * @property {GetState} getState - Get data about user, activity, or context.
 * @property {Storage} storage - storage methods
 * @property {Plugins} plugins - plugin methods
 */
class Instance {
  constructor(config) {
    try {
      this._instanceReady = false;
      this._storage = new Storage();
      this._plugins = new Plugins(config.plugins, config.app);
      this._config = config;
    } catch (error) {
      logEvent(
        'error',
        'AnalyticsModuleError: Failed to instance',
        error,
      );
    }
  }

  /**
    * Identify a user. This will trigger `identify` calls in any
    * installed plugins and will set user data in localStorage
    * @param  {String}   userId  - Unique ID of user
    * @param  {Object}   [traits]  - Object of user traits
    * @param  {Object}   [options] - Options to pass to identify call
    * @param  {Function} [callback] - Callback function after identify completes
    * @returns {Promise}
    *
    * @example
    *
    * // Basic user id identify
    * analytics.identify(7300)
    *
    * // Identify with additional traits
    * analytics.identify(7300, {
    *   name: 'sunny',
    *   batch: 'coolest batch under the sun',
    * })
    *
    * // Fire callback with 2nd or 3rd argument
    * analytics.identify(7300, () => {
    *   console.log('do this after identify')
    * })
    *
    * // Disable sending user data to specific analytic tools
    * analytics.identify(7300, {}, {
    *   plugins: {
    *     // disable sending this identify call to mixpanel
    *     mixpanel: false
    *   }
    * })
    *
    * // Send user data to only to specific analytic tools
    * analytics.identify(7300, {}, {
    *   plugins: {
    *     // disable this specific identify in all plugins except mixpanel
    *     all: false,
    *     mixpanel: true
    *   }
    * })
    */
  async identify(userId, traits, options, callback) {
    const id = isString(userId) ? userId : null;
    const data = isObject(userId) ? userId : traits;
    const opts = options || {};
    const fallbackUserId = await this._getResolvedId(
      DEFINED_USER_TRAITS.userID, data,
    );

    /* sets temporary in memory id. Not to be relied on */
    await analyticsStorage.setItem(tempKey(DEFINED_USER_TRAITS.userID), id);

    const resolvedId = id || data.userId || fallbackUserId;
    return new Promise((resolve) => {
      store.dispatch({
        type: ACTIONS.identify,
        userId: resolvedId,
        traits: data || {},
        options: opts,
        app: this.app,
        instance: this,
      }, resolve, [traits, options, callback]);
    });
  }

  /**
     * Track an analytics event.
     * This will trigger `track` calls in any installed plugins
     * @param  {String}   eventName - Event name
     * @param  {Object}   [payload]   - Event payload
     * @param  {Object}   [options]   - Event options
     * @param  {Function} [callback]  - Callback to fire after tracking event
     * @returns {Promise}
     * @api public
     *
     * @example
     *
     * // Basic event tracking
     * analytics.track('buttonClicked')
     *
     * // Event tracking with payload
     * analytics.track('batchChangeRequest', {
     *   from: 'coolest-batch-under-the-sun,
     *   to: 'coolest-batch-under-sunny',
     * })
     *
     * // Fire callback with 2nd or 3rd argument
     * analytics.track('batchChanged', () => {
     *   console.log('do this after track')
     * })
     *
     * // Disable sending this event to specific analytic tools
     * analytics.track('problemsSolved', {
     *   problems: [1, 2]
     * }, {
     *   plugins: {
     *     // disable track event for mixpanel
     *     mixpanel: false
     *   }
     * })
     *
     * // Send event to only to specific analytic tools
     * analytics.track('problemsSolved', {
     *   problems: [1, 2]
     * }, {
     *   plugins: {
     *     // disable this specific track call all plugins except mixpanel
     *     all: false,
     *     mixpanel: true
     *   }
     * })
     */
  // eslint-disable-next-line class-methods-use-this
  async track(action, eventName, source, payload, options, callback) {
    const name = isObject(eventName) ? eventName.event : eventName;

    if (!Object.keys(ANALYTICS_ACTION_TYPES).includes(action)) {
      logEvent(
        'error',
        `AnalyticsModuleError: Invalid action type: ${action}`,
      );
      return null;
    }

    if (!name || !isString(name)) {
      logEvent(
        'error',
        'AnalyticsModuleError: track eventName is required',
      );
      return null;
    }

    const data = isObject(eventName) ? eventName : (payload || {});
    const opts = isObject(options) ? options : {};
    const userId = await this._getResolvedId(
      DEFINED_USER_TRAITS.userID, payload,
    );

    return new Promise((resolve) => {
      store.dispatch({
        type: ACTIONS.track,
        event: name,
        properties: {
          ...data,
          action,
          source,
          app: this.app,
        },
        options: opts,
        userId,
        app: this.app,
        instance: this,
      }, resolve, [payload, options, callback]);
    });
  }

  /**
     * Trigger page view. This will trigger `page`
     * calls in any installed plugins
     * @param  {PageData} [data] - Page data overrides.
     * @param  {Object}   [options] - Page tracking options
     * @param  {Function} [callback] - Callback to fire after page view call
     * @returns {Promise}
     * @api public
     *
     * @example
     *
     * // Basic page tracking
     * analytics.page()
     *
     * // Page tracking with page data overrides
     * analytics.page({
     *   url: 'https://scaler.com'
     * })
     *
     * // Fire callback with 1st, 2nd or 3rd argument
     * analytics.page(() => {
     *   console.log('do this after page')
     * })
     *
     * // Disable sending this pageview to specific analytic tools
     * analytics.page({}, {
     *   plugins: {
     *     // disable page tracking event for mixpanel
     *     mixpanel: false
     *   }
     * })
     *
     * // Send pageview to only to specific analytic tools
     * analytics.page({}, {
     *   plugins: {
     *     // disable this specific page in all plugins except mixpanel
     *     all: false,
     *     mixpanel: true
     *   }
     * })
     */
  async page(data, options, callback) {
    const d = isObject(data) ? data : {};
    const opts = isObject(options) ? options : {};
    const userId = await this._getResolvedId(DEFINED_USER_TRAITS.userID, d);

    return new Promise((resolve) => {
      store.dispatch({
        type: ACTIONS.page,
        properties: {
          ...getPageData(d),
          app: this.app,
        },
        options: opts,
        userId,
        app: this.app,
        instance: this,
      }, resolve, [data, options, callback]);
    });
  }

  /**
     * Clear all information about the user & reset analytic state.
     * @param {Function} [callback] - Handler to run after reset
     * @returns {Promise}
     * @example
     *
     * // Reset current user
     * analytics.reset()
     */
  // eslint-disable-next-line class-methods-use-this
  reset(callback) {
    return new Promise((resolve) => {
      store.dispatch({
        type: ACTIONS.reset,
        app: this.app,
        instance: this,
      }, resolve, callback);
    });
  }

  /**
   * Get data about user, activity, or context.
   * Access sub-keys of state with `dot.prop` syntax.
   * @param  {string} [key] - dot.prop.path value of state
   * @return {any}
   *
   * @example
   *
   * // Get the current state of analytics
   * analytics.getState()
   *
   * // Get a subpath of state
   * analytics.getState('context.offline')
   */
  // eslint-disable-next-line class-methods-use-this
  getState(key) {
    const state = store.getState();
    if (key) return get(state, key);
    return { ...state };
  }

  /*
     * Emit events for other plugins or middleware to react to.
     * @param  {Object} action - event to dispatch
     */
  // eslint-disable-next-line class-methods-use-this
  dispatch(action) {
    const actionData = isString(action) ? { type: action } : action;
    if (isReservedAction(actionData.type)) {
      logEvent(
        'error',
        `AnalyticsModuleError: reserved action ${actionData.type}`,
      );
      return;
    }
    const _private = action._ || {};
    const dispatchData = {
      ...actionData,
      app: this.app,
      _: {
        originalAction: actionData.type,
        ..._private,
      },
    };
    store.dispatch(dispatchData);
  }

  /**
   * Track an analytics event click.
   * This will trigger `track` calls in any installed plugins
   * @param  {String}   eventName - Event name
   * @param  {String}   source - Location of event eg. banner, button, etc
   * @param  {Object}   [payload]   - Event payload
   * @param  {Object}   [options]   - Event options
   * @param  {Function} [callback]  - Callback to fire after tracking event
   * @returns {Promise}
   * @api public
   *
   * @example
   *
   * // Basic click event tracking
   * analytics.click('CHR Raised', 'chr-banner')
   *
   * // Event tracking with payload
   * analytics.click('CHR Raise', 'chr-banner', {
   *   from: 'coolest-batch-under-the-sun,
   *   to: 'coolest-batch-under-sunny',
   * })
   *
   * // Fire callback with 2nd or 3rd argument
   * analytics.click('batchChanged', 'home', () => {
   *   console.log('do this after track')
   * })
   *
   * // Disable sending this event to specific analytic tools
   * analytics.click('problemsSolved', 'problemsPage', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     // disable track event for mixpanel
   *     mixpanel: false
   *   }
   * })
   *
   * // Send event to only to specific analytic tools
   * analytics.click('problemsSolved', 'assignmentsPage', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     // disable this specific track call all plugins except mixpanel
   *     all: false,
   *     mixpanel: true
   *   }
   * })
   */
  click(eventName, source, payload, options, callback) {
    return this.track(
      ANALYTICS_ACTION_TYPES.click,
      eventName,
      source,
      payload,
      options,
      callback,
    );
  }

  /**
   * Track an analytics event timing.
   * This will trigger `track` calls in any installed plugins
   * @param  {String}   eventName - Event name
   * @param  {String}   source - Location of event eg. banner, button, etc
   * @param  {String}   timing - Time spent on event
   * @param  {Object}   [payload]   - Event payload
   * @param  {Object}   [options]   - Event options
   * @param  {Function} [callback]  - Callback to fire after tracking event
   * @returns {Promise}
   * @api public
   *
   * @example
   *
   * // Basic time event tracking
   * analytics.timing('Time spent viewing classroom', 'Classroom', 1000)
   * analytics.timing('Time spent viewing classroom', 'Mini Classroom', 1000)
   *
   * // Event tracking with payload
   * analytics.timing('Time spent viewing classroom', 'Classroom', 1000, {
   *  xyz: 'abc',
   * })
   *
   * // Disable sending this event to specific analytic tools
   * analytics.timing('Time spent viewing classroom', 'Classroom', 1000, {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     // disable track event for mixpanel
   *     mixpanel: false
   *   }
   * })
   *
   * // Send event to only to specific analytic tools
   * analytics.timing('Time spent viewing classroom', 'Classroom', 1000, {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     all: false,
   *     mixpanel: true
   *   }
   * })
   */
  timing(source, time, payload, options, callback) {
    const data = isObject(payload) ? {
      time,
      ...payload,
    } : { time };
    const eventName = `${source} - Timing`;

    return this.track(
      ANALYTICS_ACTION_TYPES.timing,
      eventName,
      source,
      data,
      options,
      callback,
    );
  }

  /**
   * Track an analytics event submit.
   * This will trigger `track` calls in any installed plugins
   * @param  {String}   eventName - Event name
   * @param  {String}   source - Location of event eg. banner, button, etc
   * @param  {Object}   [payload]   - Event payload
   * @param  {Object}   [options]   - Event options
   * @param  {Function} [callback]  - Callback to fire after tracking event
   * @returns {Promise}
   * @api public
   *
   * @example
   *
   * // Basic submit event tracking
   * analytics.submit('CHR Raise', 'Classroom CHR Form')
   *
   * // Event tracking with payload
   * analytics.submit('CHR Raise', 'Classroom CHR Form', {
   *  xyz: 'abc',
   * })
   *
   * // Disable sending this event to specific analytic tools
   * analytics.submit('CHR Raise', 'Classroom CHR Form', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     // disable track event for mixpanel
   *     mixpanel: false
   *   }
   * })
   *
   * // Send event to only to specific analytic tools
   * analytics.submit('CHR Raise', 'Classroom CHR Form', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     all: false,
   *     mixpanel: true
   *   }
   * })
   */
  submit(eventName, source, payload, options, callback) {
    return this.track(
      ANALYTICS_ACTION_TYPES.submit,
      eventName,
      source,
      payload,
      options,
      callback,
    );
  }

  /**
   * Track an analytics event submit.
   * This will trigger `track` calls in any installed plugins
   * @param  {String}   eventName - Event name
   * @param  {String}   source - Location of event eg. banner, button, etc
   * @param  {Object}   [payload]   - Event payload
   * @param  {Object}   [options]   - Event options
   * @param  {Function} [callback]  - Callback to fire after tracking event
   * @returns {Promise}
   * @api public
   *
   * @example
   *
   * // Basic focus event tracking
   * analytics.focus('CHR Raise', 'Classroom CHR Form')
   *
   * // Event tracking with payload
   * analytics.focus('CHR Raise', 'Classroom CHR Form', {
   *  xyz: 'abc',
   * })
   *
   * // Disable sending this event to specific analytic tools
   * analytics.focus('CHR Raise', 'Classroom CHR Form', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     // disable track event for mixpanel
   *     mixpanel: false
   *   }
   * })
   *
   * // Send event to only to specific analytic tools
   * analytics.focus('CHR Raise', 'Classroom CHR Form', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     all: false,
   *     mixpanel: true
   *   }
   * })
   */
  focus(eventName, source, payload, options, callback) {
    return this.track(
      ANALYTICS_ACTION_TYPES.focus,
      eventName,
      source,
      payload,
      options,
      callback,
    );
  }

  /**
   * Track an analytics event view.
   * This will trigger `track` calls in any installed plugins
   * @param  {String}   eventName - Event name
   * @param  {String}   source - Location of event eg. banner, button, etc
   * @param  {Object}   [payload]   - Event payload
   * @param  {Object}   [options]   - Event options
   * @param  {Function} [callback]  - Callback to fire after tracking event
   * @returns {Promise}
   * @api public
   *
   * @example
   *
   * // Basic view event tracking
   * analytics.view('NPS Rating Modal', 'CHR Request Modal')
   *
   * // Event tracking with payload
   * analytics.view('NPS Rating Modal', 'CHR Request Modal', {
   *  xyz: 'abc',
   * })
   *
   * // Disable sending this event to specific analytic tools
   * analytics.view('NPS Rating Modal', 'CHR Request Modal', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     // disable track event for mixpanel
   *     mixpanel: false
   *   }
   * })
   *
   * // Send event to only to specific analytic tools
   * analytics.view('NPS Rating Modal', 'CHR Request Modal', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     all: false,
   *     mixpanel: true
   *   }
   * })
   */
  view(eventName, source, payload, options, callback) {
    return this.track(
      ANALYTICS_ACTION_TYPES.view,
      eventName,
      source,
      payload,
      options,
      callback,
    );
  }

  /**
   * Track an generic analytics event.
   * This will trigger `track` calls in any installed plugins
   * @param  {String}   eventName - Event name
   * @param  {String}   source - Location of event eg. banner, button, etc
   * @param  {Object}   [payload]   - Event payload
   * @param  {Object}   [options]   - Event options
   * @param  {Function} [callback]  - Callback to fire after tracking event
   * @returns {Promise}
   * @api public
   *
   * @example
   *
   * // Basic generic event tracking
   * analytics.event('NPS Rating Modal Loading', 'CHR Request Modal')
   *
   * // Event tracking with payload
   * analytics.event('NPS Rating Modal Loading', 'CHR Request Modal', {
   *  xyz: 'abc',
   * })
   *
   * // Disable sending this event to specific analytic tools
   * analytics.event('NPS Rating Modal Loading', 'CHR Request Modal', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     // disable track event for mixpanel
   *     mixpanel: false
   *   }
   * })
   *
   * // Send event to only to specific analytic tools
   * analytics.event('NPS Rating Modal Loading', 'CHR Request Modal', {
   *   problems: [1, 2]
   * }, {
   *   plugins: {
   *     all: false,
   *     mixpanel: true
   *   }
   * })
   */
  event(eventName, source, payload, options, callback) {
    return this.track(
      ANALYTICS_ACTION_TYPES.event,
      eventName,
      source,
      payload,
      options,
      callback,
    );
  }

  get storage() {
    return this._storage;
  }

  get plugins() {
    return this._plugins;
  }

  get app() {
    return this.config.app;
  }

  get config() {
    return this._config;
  }

  get shouldTrack() {
    /**
     * Only default track events if user is in production environment
     * or shouldTrack: true is set in config
     */
    return this.config.shouldTrack || window.ENV_VARS.mode === 'production';
  }

  /**
   * PRIVATE METHODS
   */
  async _getResolvedId(key, payload) {
    /* 1. Try current state */
    const currentId = this.getState('user')[key];
    if (currentId) {
      return currentId;
    }

    /* 2. Try event payload */
    if (payload && isObject(payload) && payload[key]) {
      return payload[key];
    }

    /* 3. Try persisted data */
    const persistedInfo = await getPersistedUserData();
    const data = persistedInfo[key];
    if (data) {
      return data;
    }

    /* 4. Else, try to get in memory placeholder. */
    const fallbackUserId = await analyticsStorage.getItem(tempKey(key)) || null;
    return fallbackUserId;
  }
}

export default Instance;
