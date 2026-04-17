import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import forOwn from 'lodash/forOwn';

import { logEvent } from '@common/utils/logger';
import { PluginTypes } from '~meetings/plugins/utils';
import pluginsApi from '~meetings/api/plugins';
import * as pluginsMap from '~meetings/plugins';

// Add this as a separate store instead of adding it in meeting model as it
// is possible that we might want to add plugins to archive as well
class PluginsStore {
  plugins = observable.map({}, { deep: false });

  isLoading = false;

  constructor() {
    makeObservable(this, {
      reset: action,
      adiosPlugins: computed,
      tabPlugins: computed,
      tabsLabelMap: computed,
    });
  }

  findPlugin(pluginName) {
    return this.plugins.get(pluginName);
  }

  load = flow(function* (slug, meeting) {
    if (this.isLoading) {
      return;
    }

    this.isLoading = false;
    try {
      const json = yield pluginsApi.getList(slug);
      this._createPlugins(json.plugins, meeting);
    } catch (error) {
      // TODO Add retry logic

      // Not handling on UI for now as we are assuming that plugins are not
      // critical components
      logEvent('error', 'MeetingPluginsError: Failed to load plugins', error);
      throw error;
    }
  });


  reset() {
    this.plugins.clear();
  }

  get adiosPlugins() {
    const list = [];
    this.plugins.forEach((plugin) => {
      if (plugin.constructor.type === PluginTypes.adios && !plugin.isDisabled) {
        list.push(plugin);
      }
    });
    return list;
  }

  get tabPlugins() {
    const list = [];
    this.plugins.forEach((plugin) => {
      if (plugin.constructor.type === PluginTypes.tab && !plugin.isDisabled) {
        list.push(plugin);
      }
    });
    return list;
  }

  get tabsLabelMap() {
    return this.tabPlugins.reduce((m, plugin) => ({
      ...m,
      [plugin.tabName]: plugin.constructor.tabLabel,
    }), {});
  }

  _createPlugins(plugins, meeting) {
    forOwn(plugins, (data, name) => {
      const PluginClass = pluginsMap[name];
      if (PluginClass) {
        const plugin = new PluginClass(this, data, meeting);
        this.plugins.set(name, plugin);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Plugin '${name}' is not defined`);
      }
    });
  }
}

const pluginsStore = new PluginsStore();

export default pluginsStore;
