/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import SidebarItem from './SidebarItem';
import { Icon, Tappable } from '@common/ui/general';
import { useMediaQuery } from '@common/hooks';

function SidebarContent({
  className,
  sidebarClasses,
  arrowClasses,
  items,
  device,
  toggle,
  hasHeaderToggleBtn,
  gaCategory = '',
  headerContent,
  footerContent,
  hasSidebarHeader = true,
  ...remainingProps
}) {
  const { mobile } = useMediaQuery();

  const trackGaEvent = useCallback((payload) => {
    window.trackGaEvent('Academy-Sidebar', 'Navigation', payload);
  }, []);

  function isVisible(item) {
    if (item.isVisible === undefined) { return true; }
    return item.isVisible;
  }

  return (
    <>
      {hasHeaderToggleBtn
        && (
          <div className="sidebar__open-btn">
            <Tappable
              className="btn btn-icon btn-inverted"
              onClick={toggle}
            >
              <Icon name="hamburger" />
            </Tappable>
          </div>
        )}
      <div
        data-testid="sidebar"
        className={classNames(
          'sidebar',
          className,
        )}
        {...remainingProps}
      >
        {hasSidebarHeader && (
          <div className="sidebar__header" onClick={toggle}>
            <span className="sidebar__header-text">
              Scaler
            </span>
            <span className={classNames(
              'sidebar__arrow',
              arrowClasses,
            )}
            />
          </div>
        )}
        {mobile && hasHeaderToggleBtn && (
          <div className="sidebar__close-btn" data-testid="sidebar-close-icon">
            <Tappable
              className="btn btn-icon btn-inverted"
              onClick={toggle}
            >
              <Icon name="close" />
            </Tappable>
          </div>
        )}
        {headerContent}
        <div
          className="sidebar__content scroll-bar-hidden"
          onClick={mobile ? toggle : null}
        >
          {items.map((item, i) => (
            isVisible(item) && (
              <SidebarItem
                key={i}
                onClick={() => trackGaEvent(`${gaCategory}${item.item}`)}
                gtmEventType="side_nav"
                gtmEventAction="click"
                gtmEventResult={item.item}
                gtmEventLink={item.to}
                {...item}
              />
            )))}
        </div>
        {footerContent}
      </div>
    </>
  );
}

SidebarContent.propTypes = {
  className: PropTypes.string,
  items: PropTypes.array.isRequired,
};

export default SidebarContent;
