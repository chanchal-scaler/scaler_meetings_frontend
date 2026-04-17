/* eslint-disable no-param-reassign */
import { createElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as CustomPropTypes from '@common/utils/propTypes';

function Skeleton({
  className,
  component = 'div',
  height,
  style,
  variant = 'rect',
  width,
  animationDisabled,
  color,
  ...remainingProps
}) {
  if (variant === 'text') {
    height = height || 16;
  } else if (variant === 'circle') {
    width = width || 36;
    height = width;
  }

  let colorStyles = {};
  if (color) {
    colorStyles = {
      backgroundColor: color,
    };
  }

  return createElement(
    component,
    {
      className: classNames(
        'skeleton',
        `skeleton--${variant}`,
        { 'skeleton--no-animation': animationDisabled },
        { [className]: className },
      ),
      style: {
        height,
        width,
        ...style,
        ...colorStyles,
      },
      ...remainingProps,
    },
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
  component: CustomPropTypes.componentPropType.isRequired,
  height: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  variant: PropTypes.oneOf(['circle', 'rect', 'text']).isRequired,
  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
};

export default Skeleton;
