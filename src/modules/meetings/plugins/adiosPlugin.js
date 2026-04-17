import { PluginNames, PluginTypes } from './utils';
import Plugin from './plugin';

class AdiosPlugin extends Plugin {
  static pluginName = PluginNames.adiosPlugin;

  static type = PluginTypes.adios;
}

export default AdiosPlugin;
