import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { forwardRef } from '@common/ui/hoc';

/**
 * Use this as the root most component and all children should be inside this
 * so all classes from the stylesheet are applicable on your application
 */
function StyleScope({
  className,
  component = 'div',
  forwardedRef,
  ...remainingProps
}) {
  return React.createElement(
    component,
    {
      className: classNames(
        'react-root',
        { [className]: className },
      ),
      ref: forwardedRef,
      ...remainingProps,
    },
  );
}

StyleScope.propTypes = {
  className: PropTypes.string,
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
  ]).isRequired,
};

export default forwardRef(StyleScope);
