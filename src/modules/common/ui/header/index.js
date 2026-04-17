import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import HeaderContent from '@common/ui/header/HeaderContent';
import BrandLogo from './BrandLogo';
import AccountDropdown from './AccountDropdown';

function HeaderComponent({
  className,
  items,
  brandLogo,
  dropDown,
  showWhatsappTooltip = false,
  showIvrTooltip = false,
  showHamburger = true,
  hamburgerClick,
  sidebarOpen,
}) {
  return (
    <HeaderContent
      className={classNames(
        { [className]: className },
      )}
      items={items}
      brandLogo={brandLogo}
      dropDown={dropDown}
      showWhatsappTooltip={showWhatsappTooltip}
      showIvrTooltip={showIvrTooltip}
      showHamburger={showHamburger}
      sidebarOpen={sidebarOpen}
      hamburgerClick={hamburgerClick}
    />
  );
}

HeaderComponent.propTypes = {
  items: PropTypes.object.isRequired,
};

const Header = HeaderComponent;

Header.Logo = BrandLogo;
Header.AccountDropdown = AccountDropdown;

export default Header;
