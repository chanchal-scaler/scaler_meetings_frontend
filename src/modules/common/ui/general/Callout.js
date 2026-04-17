import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { componentPropType } from '@common/utils/propTypes';

function Callout({
  className,
  component = 'div',
  type = 'primary',
  variant = 'background',
  ...remainingProps
}) {
  return React.createElement(
    component,
    {
      className: classNames(
        'callout',
        `callout--${type}`,
        `callout--${variant}`,
        { [className]: className },
      ),
      ...remainingProps,
    },
  );
}

Callout.propTypes = {
  component: componentPropType,
  type: PropTypes.oneOf(['primary', 'success', 'warning', 'danger']),
  variant: PropTypes.oneOf(['background', 'border']),
};

export default Callout;
