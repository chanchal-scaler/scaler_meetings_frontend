import React from 'react';
import classNames from 'classnames';

import Icon from './Icon';
import Tappable from './Tappable';

function Ribbon({
  className,
  children,
  onClose,
  canClose,
  type,
  showCloseLink = true,
}) {
  return (
    <div
      className={classNames(
        'm-ribbon',
        'm-ribbon--default',
        `m-ribbon--${type}`,
        { [className]: className },
      )}
    >
      {canClose && (
        <Tappable className="m-ribbon__close" onClick={onClose}>
          <Icon name="close" />
        </Tappable>
      )}
      {children}
    </div>
  );
}

export default Ribbon;
