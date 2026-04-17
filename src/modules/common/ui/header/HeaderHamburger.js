import React from 'react';

import BurgerMenuIcon from '@common/ui/general/BurgerMenuIcon';

function HeaderHamburger({ onClick }) {
  return (
    <BurgerMenuIcon
      onClick={onClick}
      className="primary no-highlight"
      data-cy="header-hamburger-icon"
      data-testid="header-hamburger"
    />
  );
}

export default HeaderHamburger;
