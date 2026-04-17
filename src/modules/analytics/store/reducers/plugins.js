import ACTIONS, { ANALYTICS_NAMESPACE } from '~analytics/store/actions';

function togglePluginStatus({
  plugins, status, currentState, app,
}) {
  return plugins.reduce((acc, pluginKey) => {
    acc[app][pluginKey] = {
      ...currentState[pluginKey],
      enabled: status,
    };
    return acc;
  }, currentState);
}

function getNameFromEventType(type, baseName) {
  return type.substring(baseName.length + 1, type.length);
}

export default function (state = {}, action) {
  const { app } = action;
  const newState = { [app]: {} };
  if (/^analytics\/registerPlugin:([^:]*)$/.test(action.type)) {
    const name = getNameFromEventType(
      action.type,
      `${ANALYTICS_NAMESPACE}/registerPlugin`,
    );
    const { plugin } = action;
    if (!plugin || !name) {
      return state;
    }
    const isEnabled = action.enabled;
    const { config } = plugin;
    newState[app][name] = {
      enabled: isEnabled,
      /* if no initialization method. Set initialized true */
      initialized: (isEnabled) ? Boolean(!plugin.initialize) : false,
      /*
        If plugin enabled === false, set loaded to false,
      */
      loaded: (isEnabled) ? Boolean(plugin.loaded) : false,
      config,
    };
    return { ...state, ...newState };
  }
  if (/^analytics\/initialize:([^:]*)$/.test(action.type)) {
    const name = getNameFromEventType(
      action.type,
      ACTIONS.initialize,
    );
    const { plugin } = action;
    if (!plugin || !name) {
      return state;
    }
    newState[app][name] = {
      ...state[app]?.[name],
      ...{
        name,
        initialized: true,
        /* check plugin.loaded function */
        loaded: Boolean(plugin.loaded),
      },
    };
    return { ...state, ...newState };
  }
  if (/^analytics\/ready:([^:]*)$/.test(action.type)) {
    newState[app][action.name] = {
      ...state[app]?.[action.name],
      oaded: true,
    };
    return { ...state, ...newState };
  }
  switch (action.type) {
    /* When analytics.plugins.disable called */
    case ACTIONS.disablePlugin:
      return {
        ...state,
        ...togglePluginStatus({
          plugins: action.plugins,
          status: false,
          currentState: state,
          app,
        }),
      };
    /* When analytics.plugins.enable called */
    case ACTIONS.enablePlugin:
      return {
        ...state,
        ...togglePluginStatus({
          plugins: action.plugins,
          status: true,
          currentState: state,
          app,
        }),
      };
    default:
      return state;
  }
}
