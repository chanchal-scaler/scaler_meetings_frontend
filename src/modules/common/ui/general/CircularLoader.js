import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function CircularLoader({
  className,
  size = 20,
  style = {},
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'circular-loader',
        { [className]: className },
      )}
      style={{ ...style, width: size, height: size }}
      {...remainingProps}
    />
  );
}

CircularLoader.propTypes = {
  size: PropTypes.number.isRequired,
};

export default CircularLoader;
