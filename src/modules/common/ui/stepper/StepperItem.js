import { createElement, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as CustomPropTypes from '@common/utils/propTypes';

function StepperItem({
  activeClassName,
  className,
  component = 'div',
  isActive,
  isLocked,
  inactiveClassName,
  onClick,
  onRequestChange,
  stepIndex,
  ...remainingProps
}) {
  const handleClick = useCallback(() => {
    if (!isLocked) {
      onRequestChange(stepIndex);
    }

    // eslint-disable-next-line no-unused-expressions
    onClick && onClick();
  }, [isLocked, onClick, onRequestChange, stepIndex]);

  return createElement(
    component,
    {
      className: classNames(
        'stepper-item',
        { 'stepper-item--active': isActive },
        { [activeClassName]: isActive },
        { 'stepper-item--locked': isLocked },
        { [inactiveClassName]: isLocked },
        { [className]: className },
      ),
      onClick: handleClick,
      ...remainingProps,
    },
  );
}

StepperItem.propTypes = {
  activeClassName: PropTypes.string,
  className: PropTypes.string,
  component: CustomPropTypes.componentPropType.isRequired,
  isActive: PropTypes.bool,
  isLocked: PropTypes.bool,
  inactiveClassName: PropTypes.string,
  onClick: PropTypes.func,
  onRequestChange: PropTypes.func,
  stepIndex: PropTypes.number,
};

export default StepperItem;
