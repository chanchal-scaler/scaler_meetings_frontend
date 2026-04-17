import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { forwardRef } from '@common/ui/hoc';
import Icon from './Icon';

function Chip({
  children,
  className,
  leftIconName,
  leftIconClassName,
  onLeftIconClick,
  rightIconName,
  rightIconClassName,
  onRightIconClick,
  color = 'default',
  component = 'div',
  isOutlined = false,
  forwardedRef,
  ...remainingProps
}) {
  return React.createElement(
    component,
    {
      className: classNames(
        'chip',
        { 'chip--outlined': isOutlined },
        color ? `chip--${color}` : null,
        { [className]: className },
      ),
      ref: forwardedRef,
      ...remainingProps,
    },
    [
      leftIconName ? (
        <Icon
          key="left-icon"
          className={classNames(
            'chip__icon--left',
            { [leftIconClassName]: leftIconClassName },
          )}
          name={leftIconName}
          onClick={onLeftIconClick}
        />
      ) : null,
      children,
      rightIconName ? (
        <Icon
          key="right-icon"
          className={classNames(
            'chip__icon--right',
            { [rightIconClassName]: rightIconClassName },
          )}
          name={rightIconName}
          onClick={onRightIconClick}
        />
      ) : null,
    ],
  );
}

Chip.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  leftIconName: PropTypes.string,
  leftIconClassName: PropTypes.string,
  rightIconName: PropTypes.string,
  rightIconClassName: PropTypes.string,
  color: PropTypes.oneOf([
    'default',
    'primary',
    'danger',
    'attention',
    'hint',
    'warning',
    'success',
  ]),
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  isOutlined: PropTypes.bool.isRequired,
};

export default forwardRef(Chip);
