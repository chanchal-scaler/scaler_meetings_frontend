import { removeNamespace } from '~analytics/store/actions';

/**
 * Checks whether the plugin has implemented the method and returns
 * the method if it exists.
 * @param {String} methodName - track, page, etc.
 * @param {Array} plugins - array of plugins
 * @returns Array
 */
function getPluginFunctions(methodName, plugins, instance) {
  return plugins.reduce((arr, plugin) => {
    const currentPlugin = instance.plugins.allPlugins[plugin.name];
    return (
      (!currentPlugin[methodName]) ? arr : arr.concat({
        methodName,
        pluginName: plugin.name,
        method: currentPlugin[methodName],
      })
    );
  }, []);
}

/* Collect all calls for a given event in the system */
export default function getAllMatchingCalls(
  eventType,
  activePlugins,
  instance,
) {
  const eventTypeWithoutNamespace = removeNamespace(eventType);
  return getPluginFunctions(eventTypeWithoutNamespace, activePlugins, instance);
}
