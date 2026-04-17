/* Core Analytic Actions */
export const ANALYTICS_NAMESPACE = 'analytics';

export const coreActions = [
  /**
   * `bootstrap` - Fires when analytics library starts up.
   * This is the first action fired.
   * '.on/once' listeners are not allowed on bootstrap
   * Plugins can attach logic to this action
   */
  'bootstrap',
  /**
   * `params` - Fires when analytics parses URL parameters
   */
  'params',
  /**
   * `heartbeat` - Fires when analytics engine sends a heartbeat
   */
  'heartbeat',
  /**
   * `initialize` - Fires when analytics loads plugins
   */
  'initialize',
  /**
   * `ready` - Fires when all analytic providers
   *  are fully loaded. This waits for 'initialize' and 'loaded' to return true
   */
  'ready',
  /**
   * `reset` - Fires if analytic.reset() is called.
   * Use this action to run custom cleanup logic (if needed)
   */
  'reset',
  /** ****************
   * Page Events
   ***************** */
  /**
   * `page` - Core analytics hook for page views.
   *  If your plugin or integration tracks page views,
   *  this is the action to fire on.
   */
  'page',
  /** **************
   * Track Events
   ************** */
  /**
   * `track` - Core analytics hook for action tracking.
   *  If your plugin or integration tracks custom actions,
   *  this is the action to fire on.
   */
  'track',
  /** ****************
   * Identify Events
   ***************** */
  /**
   * `identify` - Core analytics hook for user identification.
   *  If your plugin or integration identifies
   *  users or user traits, this is the action to fire on.
   */
  'identify',
  /**
   * `userIdChanged` - Fires when a user id is updated
   */
  'userIdChanged',
  /** ****************
   * Plugin Events
   ***************** */
  /**
   * `registerPlugins` - Fires when analytics is registering plugins
   */
  'registerPlugins',
  /**
   * `enablePlugin` - Fires when 'analytics.plugins.enable()' is called
   */
  'enablePlugin',
  /**
   * `disablePlugin` - Fires when 'analytics.plugins.disable()' is called
   */
  'disablePlugin',
  /*
   * `loadPlugin` - Fires when 'analytics.loadPlugin()' is called
   */
  // 'loadPlugin',
  /** ****************
   * Browser activity actions
   ***************** */
  /**
   * `online` - Fires when browser network goes online.
   * This fires only when coming back online from an offline state.
   */
  'online',
  /**
   * `offline` - Fires when browser network goes offline.
   */
  'offline',
  /** ****************
   * Storage actions
   ***************** */
  /**
   * `setItem` - Fires when analytics.storage.setItem is called.
   * This action gives plugins the ability to intercept keys
   * & values and alter them before they are persisted.
   */
  'setItem',
  /**
   * `removeItem` - Fires when analytics.storage.removeItem is called.
   * This action gives plugins the ability to
   * intercept removeItem calls and abort / alter them.
   */
  'removeItem',
];

/* Keys on a plugin that are not considered actions */
export const nonActions = ['name', 'ACTIONS', 'config', 'loaded'];

const pluginActions = {
  registerPluginType: (name) => `${ANALYTICS_NAMESPACE}/registerPlugin:${name}`,
  initializeType: (name) => `${ANALYTICS_NAMESPACE}/initialize:${name}`,
  pluginReadyType: (name) => `${ANALYTICS_NAMESPACE}/ready:${name}`,
};

const ACTIONS = coreActions.reduce((acc, curr) => {
  const namespacedAction = `${ANALYTICS_NAMESPACE}/${curr}`;
  acc[curr] = namespacedAction;
  return acc;
}, pluginActions);

export function isReservedAction(type) {
  const namespacedAction = `${ANALYTICS_NAMESPACE}/${type}`;
  return coreActions.includes(namespacedAction);
}

export function removeNamespace(type) {
  return type.replace(`${ANALYTICS_NAMESPACE}/`, '');
}

export default ACTIONS;
