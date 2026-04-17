export function getConfig(name, pluginState, allPlugins) {
  const pluginData = pluginState[name] || allPlugins[name];
  if (pluginData && pluginData.config) {
    return pluginData.config;
  }
  return {};
}
