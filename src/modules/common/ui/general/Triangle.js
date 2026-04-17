import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { isString } from '@common/utils/type';

function Triangle({
  className,
  direction,
  position = 'center',
  size = 16,
  style,
  ...remainingProps
}) {
  const positionStyles = isString(position) ? {} : position;

  return (
    <div
      className={classNames(
        'triangle',
        `triangle--${direction}`,
        { 'triangle--center': position === 'center' },
      )}
      style={{
        ...style,
        ...positionStyles,
        width: size,
        height: size,
        [direction]: -1 * ((size - 1) / 2),
      }}
      {...remainingProps}
    />
  );
}

Triangle.propTypes = {
  direction: PropTypes.oneOf(['left', 'right', 'top', 'bottom']).isRequired,
  position: PropTypes.oneOfType([
    PropTypes.oneOf(['center']),
    PropTypes.object,
  ]).isRequired,
  size: PropTypes.number.isRequired,
};

export default Triangle;
