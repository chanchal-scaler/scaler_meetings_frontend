import React from 'react';
import classNames from 'classnames';

import { NavigationTabsContext } from './useNavigationTabsData';

function NavigationTabs({
  activeTabClassName,
  className,
  tabClassName,
  ...remainingProps
}) {
  return (
    <NavigationTabsContext.Provider
      value={{
        activeTabClassName,
        tabClassName,
      }}
    >
      <div
        className={classNames(
          'navigation-tabs',
          { [className]: className },
        )}
        {...remainingProps}
      />
    </NavigationTabsContext.Provider>
  );
}

export default NavigationTabs;
