import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { forwardRef } from '@common/ui/hoc';
import { Icon, Tappable, Tooltip } from '@common/ui/general';
import { isNullOrUndefined } from '@common/utils/type';

const iconTypes = ['default', 'danger', 'primary'];

function IconButton({
  children,
  className,
  iconClassName,
  forwardedRef,
  icon,
  label,
  small,
  type = 'default',
  ...remainingProps
}) {
  let component = Tappable;
  let componentProps = {};

  if (!isNullOrUndefined(label)) {
    component = Tooltip;
    componentProps = {
      component: Tappable,
      title: label,
      popoverProps: { placement: 'top', margin: { top: -5 } },
    };
  }

  return createElement(component, {
    ref: forwardedRef,
    className: classNames(
      'btn btn-icon m-btn',
      { [className]: className },
      { 'btn-large': !small },
      { 'm-btn--default': type === 'default' },
      { 'btn-danger': type === 'danger' },
      { 'btn-primary': type === 'primary' },
    ),
    ...componentProps,
    ...remainingProps,
  }, (
    <>
      <Icon
        className={classNames(
          { [iconClassName]: iconClassName },
        )}
        name={icon}
      />
      {children}
    </>
  ));
}

IconButton.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  label: PropTypes.node,
  small: PropTypes.bool,
  type: PropTypes.oneOf(iconTypes),
};

export default forwardRef(IconButton);
