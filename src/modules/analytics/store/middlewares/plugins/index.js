import { logEvent } from '@common/utils/logger';
import { processQueue } from '~analytics/store/reducers/queue';
import { runCallback } from '~analytics/utils/callbackStack';
import ACTIONS, { nonActions } from '~analytics/store/actions';
import runPlugins from './engine';
import waitForReady from '~analytics/utils/waitForReady';

export default function pluginMiddleware() {
  const isReady = {};
  return store => next => async action => {
    try {
      const { type, plugins } = action;
      const updatedAction = action;

      /* Analytics.plugins.enable called, we need to init the plugins */
      if (type === ACTIONS.enablePlugin) {
        store.dispatch({
          type: ACTIONS.initialize,
          plugins,
          disabled: [],
          fromEnable: true,
          meta: action.meta,
        });
      }

      if (type === ACTIONS.disablePlugin) {
        // If cached callback, resolve promise/run callback.
        // debounced to fix race condition
        setTimeout(() => runCallback(action.meta.rid, { payload: action }), 0);
      }

      if (type === ACTIONS.initialize) {
        const allPlugins = action.allPlugins || {};
        const pluginsArray = Object.keys(allPlugins);
        const allRegisteredPlugins = pluginsArray.filter(
          (name) => plugins.includes(name),
        ).map((name) => allPlugins[name]);
        let completed = [];
        let failed = [];
        const { disabled } = action;
        const waitForPluginsToLoad = allRegisteredPlugins.map(
          async (plugin) => {
            const { name } = plugin;
            return waitForReady(plugin, plugin.loaded, 10000).then(() => {
              if (!isReady[name]) {
                store.dispatch({
                  type: ACTIONS.pluginReadyType(name), // `ready:${name}`
                  name,
                  events: Object.keys(plugin).filter(
                    (_name) => !nonActions.includes(_name),
                  ),
                  app: action.app,
                  instance: action.instance,
                });
                isReady[name] = true;
              }
              completed = completed.concat(name);

              return plugin;
            }).catch((e) => {
            // Timeout Add to queue
              if (e instanceof Error) {
                throw new Error(e);
              }
              failed = failed.concat(e.name);
              // Failed to fire, add to queue
              return e;
            });
          },
        );

        Promise.all(waitForPluginsToLoad).then(() => {
          // setTimeout to ensure runs after 'page'
          const payload = {
            plugins: completed,
            failed,
            disabled,
          };
          setTimeout(() => {
            if (
              pluginsArray.length
              === (waitForPluginsToLoad.length + disabled.length)
            ) {
              store.dispatch({
                ...{ type: ACTIONS.ready },
                app: action.app,
                instance: action.instance,
                ...payload,

              });
            }
          }, 0);
        });
      }

      /* New plugin system */
      if (type !== ACTIONS.bootstrap) {
        if (/^analytics\/ready:([^:]*)$/.test(type)) {
          // Immediately flush queue
          setTimeout(() => processQueue(store, action.instance), 0);
        }
        const updated = await runPlugins(
          action,
          store,
        );
        return next(updated);
      }

      return next(updatedAction);
    } catch (error) {
      logEvent(
        'error',
        'AnalyticsModuleError: Failed to run plugin middleware',
        error,
      );
      return next(action);
    }
  };
}
