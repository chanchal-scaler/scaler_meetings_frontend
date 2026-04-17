import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Sidebar from '@common/ui/sidebar';

function AcademyLayout({
  children,
  className,
  isSidebarDisabled = false,
  sidebarItems,
  sidebarClassName = '',
  product,
  onlySidebar = false,
  hasHeaderToggleBtn,
  sidebarGaCategory = '',
  sidebarHeaderContent,
  sidebarFooterContent,
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'dashboard',
        { [className]: className },
      )}
      {...remainingProps}
    >
      {!isSidebarDisabled && (
        <Sidebar
          className={sidebarClassName}
          items={sidebarItems}
          product={product}
          hasHeaderToggleBtn={hasHeaderToggleBtn}
          gaCategory={sidebarGaCategory || undefined}
          headerContent={sidebarHeaderContent}
          footerContent={sidebarFooterContent}
        />
      )}
      {onlySidebar
        ? '' : (
          <div
            className={classNames(
              'dashboard__content',
              { 'dashboard__content--sidebar-disabled': isSidebarDisabled },
            )}
          >
            {children}
          </div>
        )}
    </div>
  );
}

AcademyLayout.propTypes = {
  children: PropTypes.node,
  sidebarItems: PropTypes.array.isRequired,
  sidebarClassName: PropTypes.string,
};

export default AcademyLayout;
