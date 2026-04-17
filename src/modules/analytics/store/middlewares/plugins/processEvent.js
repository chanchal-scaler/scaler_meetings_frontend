import { APP_WISE_ANALYTICS_TOOL_MAP } from '~analytics/utils/product';
import { getConfig } from '~analytics/utils/engine';
import { isObject } from '@common/utils/type';
import { isDevelopment } from '@common/utils/debug';
import { removeNamespace } from '~analytics/store/actions';

const bootstrapRegex = /^bootstrap/;
const readyRegex = /^ready/;

/**
 * Async reduce over matched plugin methods
 * Fires plugin functions
 */
export async function processEvent({
  data,
  action,
  state,
  allPlugins,
  store,
  instance,
}) {
  const { plugins, context } = state;
  const { app } = action;
  const appPlugins = plugins[app];
  const method = removeNamespace(action.type);

  /* Check if plugin loaded, if not mark action for queue */
  const queueData = data.reduce((acc, thing) => {
    const { pluginName, methodName } = thing;
    let addToQueue = false;
    // Queue actions if plugin not loaded except for initialize and reset
    if (
      !methodName.match(/^initialize/)
      && !methodName.match(/^reset/)
    ) {
      addToQueue = !appPlugins[pluginName].loaded;
    }
    /* If offline and its a core method. Add to queue */
    if (
      context.offline
      && (methodName.match(/^(page|track|identify)/))
    ) {
      addToQueue = true;
    }
    acc[`${pluginName}`] = addToQueue;
    return acc;
  }, {});

  // Then call the normal methods with scoped payload
  const resolvedAction = await data.reduce(async (promise, curr) => {
    const { pluginName } = curr;
    const currentPlugin = instance.plugins.allPlugins[pluginName];
    const currentActionValue = await promise;
    const payloadValue = currentActionValue;
    /**
     * Remove plugins which are not enabled for the product
     */
    const enabledPlugins = APP_WISE_ANALYTICS_TOOL_MAP[
      app
    ];
    if (
      !enabledPlugins.includes(pluginName)
      && isDevelopment()
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `Analytics tool ${pluginName} is not `
          + `enabled for app: ${app}`,
      );
      return action;
    }

    if (!instance.shouldTrack) {
      // eslint-disable-next-line no-console
      console.info(`Analytics[DEBUG]: ${pluginName} ${method}`, payloadValue);
      return action;
    }

    if (queueData[pluginName] && queueData[pluginName] === true) {
      store.dispatch({
        type: `queue`,
        plugin: pluginName,
        payload: payloadValue,
        /* Internal data for analytics engine */
        _: {
          called: `queue`,
          from: 'queueMechanism', // for debugging
        },
      });
      return Promise.resolve(currentActionValue);
    }

    /* Run the plugin function */
    const val = await currentPlugin[method]({
      payload: payloadValue,
      config: getConfig(pluginName, appPlugins, allPlugins),
      plugins: appPlugins,
    });

    const returnValue = isObject(val) ? val : {};
    const merged = {
      ...currentActionValue,
      ...returnValue,
    };

    return Promise.resolve(merged);
  }, Promise.resolve(action));

  // Dispatch End. Make sure actions don't
  // get double dispatched. EG userIdChanged
  if (
    !method.match(/^registerPlugin/)
    && !method.match(readyRegex)
    && !method.match(bootstrapRegex)
    && !method.match(/^params/)
    && !method.match(/^userIdChanged/)
  ) {
    /*
      Verify this original action setup.
      It's intended to keep actions from double dispatching themselves
    */
    if (resolvedAction._ && resolvedAction._.originalAction === method) {
      return resolvedAction;
    }

    const endAction = {
      ...resolvedAction,
      ...{
        _: {
          originalAction: resolvedAction.type,
          called: resolvedAction.type,
          from: 'engineEnd',
        },
      },
    };

    store.dispatch(endAction);
  }

  return resolvedAction;
}
