import { logEvent } from '@common/utils/logger';

export const parsePlugins = (plugins = []) => plugins.reduce((acc, plugin) => {
  try {
    const currentPlugin = plugin;

    if (!currentPlugin.name) {
      logEvent(
        'error',
        "Plugins must supply a 'name' property.",
      );
    }
    // Set config if empty
    if (!currentPlugin.config) currentPlugin.config = {};

    const enabledFromMerge = !(currentPlugin.enabled === false);
    const enabledFromPluginConfig = !(currentPlugin.config.enabled === false);
    // top level { enabled: false }
    // takes presidence over { config: enabled: false }
    acc.pluginEnabled[currentPlugin.name] = (
      enabledFromMerge && enabledFromPluginConfig
    );
    delete currentPlugin.enabled;

    acc.pluginsArray = [...acc.pluginsArray, currentPlugin];

    if (acc.plugins[currentPlugin.name]) {
      logEvent(
        'error',
        `AnalyticsModuleError: PLugin already loaded:: ${currentPlugin.name}`,
      );
    }

    acc.plugins[currentPlugin.name] = currentPlugin;
    return acc;
  } catch (error) {
    logEvent(
      'error',
      'AnalyticsModuleError: Failed to parse plugins',
      error,
    );
    return acc;
  }
}, {
  plugins: {},
  pluginEnabled: {},
  pluginsArray: [],
});
