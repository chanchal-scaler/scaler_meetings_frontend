import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useMediaQuery } from '@common/hooks';
import SidebarContent from './SidebarContent';

function Sidebar({
  className,
  items,
  hasSidebarHeader,
  hasHeaderToggleBtn,
  gaCategory,
  headerContent,
  footerContent,
  isAlwaysOpen = false,
  ...remainingProps
}) {
  const { tablet } = useMediaQuery();
  useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    setSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isOpen, setSidebarSate] = useState(false);

  const toggleSidebar = () => {
    setSidebarSate(!isOpen);
  };

  const setSidebar = () => {
    if (!isAlwaysOpen && tablet) {
      setSidebarSate(false);
    } else {
      setSidebarSate(true);
    }
  };

  return (
    <SidebarContent
      className={classNames(
        { [className]: className },
        `sidebar__${isOpen ? 'open' : 'close'}`,
      )}
      arrowClasses={classNames({
        [`icon-arrow-${tablet ? 'down' : 'left'}`]: true,
      })}
      items={items}
      toggle={toggleSidebar}
      hasHeaderToggleBtn={hasHeaderToggleBtn}
      gaCategory={gaCategory || undefined}
      headerContent={headerContent}
      footerContent={footerContent}
      hasSidebarHeader={hasSidebarHeader}
      {...remainingProps}
    />
  );
}

Sidebar.propTypes = {
  className: PropTypes.string,
  items: PropTypes.array.isRequired,
};

export default Sidebar;
