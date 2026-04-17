import { logEvent } from '@common/utils/logger';
import { processEvent } from './processEvent';
import ACTIONS from '~analytics/store/actions';
import fitlerDisabledPlugins from '~analytics/utils/filterDisabledPlugings';
import getAllMatchingCalls from '~analytics/utils/getAllMatchingCalls';

export default async function (
  action,
  store,
) {
  try {
    const { plugins } = store.getState();
    const { app, instance } = action;
    const appPlugins = plugins[app] || [];
    const originalType = action.type;

    /*
      If action already dispatched exit early.
      This makes it so plugin methods are not fired twice.
    */
    if (action._ && action._.called) {
      return action;
    }

    const state = store.getState();
    /* Remove plugins that are disabled by options or by settings */
    let activePlugins = fitlerDisabledPlugins(
      appPlugins, action.options,
    );

    /* If analytics.plugin.enable calls do special behavior */
    if (originalType === ACTIONS.initialize && action.fromEnable) {
      // Return list of all enabled plugins that have NOT been initialized yet
      activePlugins = Object.keys(state.plugins[app]).filter((name) => {
        const info = state.plugins[app][name];
        return action.plugins.includes(name) && !info.initialized;
      }).map((name) => appPlugins[name]);
    }

    const allMatches = getAllMatchingCalls(
      originalType, activePlugins, instance,
    );

    const resolvedAction = await processEvent({
      action,
      data: allMatches,
      state,
      allPlugins: appPlugins,
      store,
      instance,
    });

    return resolvedAction;
  } catch (error) {
    logEvent(
      'error',
      'AnalyticsModuleError: Failed to run engine middleware',
      error,
    );
    return action;
  }
}
