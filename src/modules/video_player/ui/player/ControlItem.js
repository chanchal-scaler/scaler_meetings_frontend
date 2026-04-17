import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { forwardRef } from '@common/ui/hoc';
import { Icon, Tappable, Tooltip } from '@common/ui/general';
import { isNullOrUndefined } from '@common/utils/type';
import { useGlobalState } from '~video_player/hooks';

function ControlItem({
  children,
  className,
  forwardedRef,
  icon,
  label,
  large = false,
  placement = 'top',
  type = 'default',
  location,
  isDisabled,
  ...remainingProps
}) {
  const { containerEl } = useGlobalState();

  let component = Tappable;
  let componentProps = {};

  if (!isNullOrUndefined(label)) {
    component = Tooltip;
    componentProps = {
      component: Tappable,
      title: label,
      isDisabled,
      popoverProps: { container: containerEl, placement, location },
    };
  }

  return createElement(component, {
    ref: forwardedRef,
    className: classNames(
      'btn vp-control-item',
      { 'vp-control-item--large': large },
      { [className]: className },
    ),
    gtmEventType: 'control_item',
    gtmEventAction: 'click',
    gtmEventResult: label,
    gtmEventCategory: 'video_player',
    type,
    ...componentProps,
    ...remainingProps,
  }, (
    <>
      <Icon name={icon} />
      {children}
    </>
  ));
}

ControlItem.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
  label: PropTypes.node,
  large: PropTypes.bool.isRequired,
  placement: PropTypes.string.isRequired,
};

export default forwardRef(ControlItem);
