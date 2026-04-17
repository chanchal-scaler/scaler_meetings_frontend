import React from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import useNavigationTabsData from './useNavigationTabsData';

function NavigationTabItem({
  activeClassName,
  className,
  ...remainingProps
}) {
  const { activeTabClassName, tabClassName } = useNavigationTabsData();

  return (
    <NavLink
      className={classNames(
        'navigation-tab-item',
        { [className]: className },
        { [tabClassName]: tabClassName },
      )}
      activeClassName={classNames(
        'navigation-tab-item--active',
        { [activeClassName]: activeClassName },
        { [activeTabClassName]: activeTabClassName },
      )}
      {...remainingProps}
    />
  );
}

export default NavigationTabItem;
