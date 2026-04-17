import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { forwardRef } from '@common/ui/hoc';
import Icon from './Icon';

function StatusTagV2({
  children,
  className,
  forwardedRef,
  size = 'default',
  leftIcon,
  rightIcon,
  type = 'default',
  iconComponent = Icon,
  ...remainingProps
}) {
  function iconUi(name, position) {
    if (name) {
      return React.createElement(
        iconComponent,
        {
          className: classNames(
            'status-tag-2__icon',
            `status-tag-2__icon--${position}`,
          ),
          name,
        },
      );
    } else {
      return null;
    }
  }

  return (
    <span
      ref={forwardedRef}
      className={classNames(
        'status-tag-2',
        `status-tag-2--${type}`,
        { [className]: className },
        { [`status-tag-2--${size}`]: size },
      )}
      {...remainingProps}
    >
      {iconUi(leftIcon, 'left')}
      {children}
      {iconUi(rightIcon, 'right')}
    </span>
  );
}

StatusTagV2.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf([
    'xs',
    'small',
    'default',
  ]).isRequired,
  leftIcon: PropTypes.string,
  rightIcon: PropTypes.string,
  type: PropTypes.oneOf([
    'attention',
    'warning',
    'success',
    'default',
    'info',
    'hint',
  ]).isRequired,
};

export default forwardRef(StatusTagV2);
