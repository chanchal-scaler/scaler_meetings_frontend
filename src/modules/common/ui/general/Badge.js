import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isString } from '@common/utils/type';

const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const types = ['alert', 'info', 'default'];

/**
 * A notification badge component. Container of this component should be
 * give `badge-container` class.
 */
function Badge({
  className,
  position = 'top-right',
  small = false,
  style = {},
  type = 'alert',
  ...remainingProps
}) {
  const isPositionClass = isString(position);
  return (
    <div
      className={classNames(
        'badge',
        `badge--${type}`,
        { [`badge--${position}`]: isPositionClass },
        { 'badge--small': small },
        { [className]: className },
      )}
      style={({ ...style, ...!isPositionClass && position })}
      {...remainingProps}
    />
  );
}

Badge.propTypes = {
  position: PropTypes.oneOfType([
    PropTypes.oneOf(positions),
    PropTypes.object,
  ]).isRequired,
  small: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(types).isRequired,
};

export default Badge;
