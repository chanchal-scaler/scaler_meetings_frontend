import React from 'react';
import { Observer } from 'mobx-react';
import classNames from 'classnames';

function TabPluginsRenderer({ plugins }) {
  function pluginUi(plugin) {
    if (plugin.constructor.unmountWhenHidden) {
      if (plugin.isActive) {
        return plugin.render();
      } else {
        return null;
      }
    } else {
      return (
        <div
          key={plugin.name}
          className={classNames(
            'plugins-tab plugins-tab--ghost',
            { 'plugins-tab--visible': plugin.isActive },
          )}
        >
          {plugin.render()}
        </div>
      );
    }
  }

  return (
    <Observer>
      {() => plugins.map(pluginUi)}
    </Observer>
  );
}

export default TabPluginsRenderer;
