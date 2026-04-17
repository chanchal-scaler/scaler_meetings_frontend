import React from 'react';
import {
  action, computed, makeObservable, observable,
} from 'mobx';
import { Observer } from 'mobx-react';

import { PluginModes } from './utils';

/**
 * Do not use this class directly rather extend it and use it.
 * This is more like a interface
 */
class Plugin {
  /**
   * Make sure to override this in the extending classes and set it to match
   * exactly the name of the plugin class.
   *
   * Why do we have to set this rather than directly using Plugin.name or in
   * the case of instance of plugin `plugin = new Plugin()` use
   * plugin.constructor.name?
   * This is because class names are changed by webpack while minification to
   * reduce bundle side. Due to this it is not possible to get the name of class
   * exactly as it is defined here in production. To overcome that we are
   * explicitly adding a static property `pluginName`
   */
  static pluginName = 'Plugin';

  /**
   * Define the react component that should be rendered by this plugin.
   *
   * Set this in the extending class
   */
  static Component = null;

  /**
   * Set this in extending class
   */
  static type = null;

  constructor(store, data, meeting, mode = PluginModes.live) {
    this._store = store;
    this._data = data;
    this._meeting = meeting;
    this._mode = mode;
    makeObservable(this, {
      _data: observable.ref,
      data: computed,
      updateData: action,
    });
  }

  /**
   * By default this method uses the static `Component` property to render
   * UI. For more complex use cases simply override this method in the
   * extending classes.
   */
  render() {
    const { Component } = this.constructor;
    if (Component) {
      return (
        <Observer key={this.name}>
          {() => (
            !this.isDisabled && <Component plugin={this} />
          )}
        </Observer>
      );
    } else {
      throw new Error(
        'The static `Component` property should be set by the extending '
        + 'plugin class',
      );
    }
  }

  updateData(newData) {
    this._data = {
      ...this._data,
      ...newData,
    };
  }

  get data() {
    return this._data;
  }

  /**
   * Customise the logic of this method if you want ot render your plugin
   * conditionally.
   *
   * If this has to be reactive make sure to mark it as computed in the
   * extending class
   */
  // eslint-disable-next-line class-methods-use-this
  get isDisabled() {
    return false;
  }

  /**
   * Live meeting model instance or archive model instance depending
   * on the mode of plugin.
   *
   * returns {MeetingBase} instance
   */
  get meeting() {
    return this._meeting;
  }

  get mode() {
    return this._mode;
  }

  /**
   * Returns the name of the plugin. Which is nothing but name of the class
   * of current instance which is added in the static property `pluginName`.
   */
  get name() {
    return this.constructor.pluginName;
  }

  /**
   * Return the underlying `pluginsStore` instance
   */
  get store() {
    return this._store;
  }
}

export default Plugin;
