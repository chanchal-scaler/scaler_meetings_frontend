import React, { useCallback } from 'react';
import { Observer } from 'mobx-react';
import { computed, makeObservable } from 'mobx';
import classNames from 'classnames';

import { DockItem } from '~meetings/ui/general';
import { Icon, SegmentedControlOption } from '@common/ui/general';
import { PluginNames, PluginTypes } from './utils';
import { useMediaQuery } from '@common/hooks';
import Plugin from './plugin';

export function ButtonRenderer({ plugin }) {
  const { mobile } = useMediaQuery();
  const { constructor, tabName } = plugin;
  const { tabIcon, tabLabel } = constructor;

  const handleChange = useCallback(() => {
    plugin.meeting.setActiveTab(tabName);
  }, [plugin.meeting, tabName]);

  return (
    <Observer>
      {() => (mobile ? (
        <SegmentedControlOption
          className="meeting-tabbar__title badge-container"
          // Passing `onChange` and `isActive` here is not ideal. This can be
          // fixed by refactoring `SegmentedControl` to use context API
          onChange={handleChange}
          isActive={plugin.isActive}
          name={tabName}
        >
          <div className="meeting-tabbar__icon">
            <Icon name={tabIcon} />
          </div>
          <div
            className={classNames(
              'meeting-tabbar__label',
              { 'meeting-tabbar__label--expanded': plugin.isActive },
            )}
          >
            {tabLabel}
          </div>
        </SegmentedControlOption>
      ) : (
        <DockItem
          badge={plugin.badge}
          badgeProps={plugin.badgeProps}
          className="right-dock__tab"
          icon={tabIcon}
          label={tabLabel}
          isActive={plugin.isActive}
          onClick={handleChange}
        />
      ))}
    </Observer>
  );
}

/**
 * Plugin that can be used to render custom content at
 * - Sidebar tabs in case of desktop
 * - Bottom panel tabs in case of mobile
 * Do not use this class directly rather extend it and use it.
 * This is more like a interface
 */
class TabPlugin extends Plugin {
  static pluginName = PluginNames.tabPlugin;

  static type = PluginTypes.tab;

  constructor(...args) {
    super(...args);
    makeObservable(this, {
      isActive: computed,
    });
  }

  /**
   * Plugins of this type need a name with which they can be uniquely
   * identified so that this name can be used to conditionally render it in
   * sidebar when it's corresponding button is clicked.
   *
   * Set this in the extending subclass.
   */
  static tabName = null;

  /**
   * If true when this is not the current active tab in sidebar the
   * rendered component will be unmounted.
   */
  static unmountWhenHidden = true;

  /**
   * The name of the icon that should be used for render the button in
   * `RightDock` or `TabBar`.
   *
   * Set this in the extending subclass.
   */
  static tabIcon = null;

  /**
   * The name of label that should be used for button.
   *
   * Set this in the extending subclass.
   */
  static tabLabel = null;

  /**
   * Every plugin of this type should render a additional UI element which
   * will be used as a button to show the actual UI of the plugin.
   *
   * Usually in case of desktop this should render a `DockItem` which will
   * be rendered in the `RightDock` and in case of mobile this should render
   * a `SegmentedControlOption`.
   *
   * For complex use cases override this method in the extending class
   */
  renderButton() {
    return (
      <Observer key={this.name}>
        {() => (
          !this.isDisabled && <ButtonRenderer plugin={this} />
        )}
      </Observer>
    );
  }

  get isActive() {
    return this.tabName === this.meeting.activeTab;
  }

  /**
   * This simply adds a getter on the instance of the class for tab name and
   * namespaces it so that it never clashes with tab names in the actual
   * meeting app.
   */
  get tabName() {
    return `plugin::${this.constructor.tabName}`;
  }

  /**
   * If you need to show a badge on the button.
   *
   * If this has to be reactive make sure to mark it as computed in the
   * extending class
   */
  // eslint-disable-next-line class-methods-use-this
  get badge() {
    return null;
  }

  /**
   * Additional props for the badge component when rendered.
   *
   * If this has to be reactive make sure to mark it as computed in the
   * extending class
   */
  // eslint-disable-next-line class-methods-use-this
  get badgeProps() {
    return {};
  }
}

export default TabPlugin;
