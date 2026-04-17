import React from 'react';
import classNames from 'classnames';

import Tappable from './Tappable';

const NUM_LINES = 3;

function BurgerMenuIcon({
  className,
  isOpen,
  size = 20,
  type = 'default',
  ...remainingProps
}) {
  return (
    <Tappable
      className={classNames(
        'burger-menu-icon',
        `burger-menu-icon--${type}`,
        { 'burger-menu-icon--open': isOpen },
        { [className]: className },
      )}
      {...remainingProps}
    >
      {new Array(NUM_LINES).fill(0).map((_, index) => (
        <div
          key={index}
          className="burger-menu-icon__line"
          style={{ width: size }}
        />
      ))}
    </Tappable>
  );
}

export default BurgerMenuIcon;
