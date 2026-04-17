import { DEFINED_USER_TRAITS } from '~analytics/utils/constants';
import { isFunction } from '@common/utils/type';
import { logEvent } from '@common/utils/logger';
import ACTIONS, { removeNamespace } from '~analytics/store/actions';

// Assign userId values if present in payload but null
function enrich(payload = {}, user = {}) {
  return [DEFINED_USER_TRAITS.userID].reduce((acc, key) => {
    if (
      payload[key]
      && user[key]
      && (user[key] !== payload[key])
    ) {
      acc[key] = user[key];
    }
    return acc;
  }, payload);
}


export function processQueue(store, instance) {
  try {
    const {
      plugins, context, queue, user,
    } = store.getState();
    const isOnline = !context.offline;
    /*
      If network connection found and there is items in queue,
      process them all
    */
    if (isOnline && queue && queue.actions && queue.actions.length) {
      const pipeline = queue.actions.reduce((acc, item, index) => {
        const { app } = item.payload;
        const isLoaded = plugins[app][item.plugin].loaded;
        if (isLoaded) {
          acc.process.push(item);
          acc.processIndex.push(index);
        } else {
          acc.requeue.push(item);
          acc.requeueIndex.push(index);
        }
        return acc;
      }, {
        processIndex: [],
        process: [],
        requeue: [],
        requeueIndex: [],
      });

      if (pipeline.processIndex && pipeline.processIndex.length) {
        pipeline.processIndex.forEach((i) => {
          const processAction = queue.actions[i];
          // Call methods directly right now
          const currentPlugin = instance.plugins.allPlugins[
            processAction.plugin
          ];
          const currentMethod = removeNamespace(processAction.payload.type);
          const method = currentPlugin[currentMethod];
          if (method && isFunction(method)) {
            /* enrich queued payload with userId if missing */
            const enrichedPayload = enrich(processAction.payload, user);
            currentPlugin[currentMethod]({
              payload: enrichedPayload,
              config: currentPlugin.config,
            });

            /* Then redispatch for .on listeners / other middleware */
            const pluginEvent = `${currentMethod}:${currentPlugin.name}`;
            store.dispatch({
              ...enrichedPayload,
              type: pluginEvent,
              /* Internal data for analytics engine */
              _: {
                called: pluginEvent,
                from: 'queueDrain',
              },
            });
          }
        });

        /* Removed processed actions */
        const reQueueActions = queue.actions.filter(
          (_, index) => pipeline.processIndex.indexOf(index) === -1,
        );

        queue.actions = reQueueActions;
      }
    }
  } catch (error) {
    logEvent(
      'error',
      'AnalyticsModuleError: Failed to process queue',
      error,
    );
  }
}

const initialState = {
  actions: [],
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'queue': {
      let actionChain;
      /* prioritize identify in event queue */
      if (payload && payload.type && payload.type === ACTIONS.identify) {
        actionChain = [action].concat(state.actions);
      } else {
        actionChain = state.actions.concat(action);
      }
      return {
        ...state,
        actions: actionChain,
      };
    }
    case 'dequeue':
      return [];
    default:
      return state;
  }
}

export const queueAction = (data, timestamp) => ({
  type: 'queue',
  timestamp,
  data,
});
