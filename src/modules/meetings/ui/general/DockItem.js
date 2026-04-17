import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Badge, Icon, Tappable } from '@common/ui/general';
import { forwardRef } from '@common/ui/hoc';

function DockItem({
  badge,
  badgeProps = { type: 'default' },
  className,
  icon,
  isActive = false,
  label,
  onClick,
  forwardedRef,
  ...remainingProps
}) {
  return (
    <Tappable
      className={classNames(
        'm-dock-item badge-container',
        { 'm-dock-item--active': isActive },
        { [className]: className },
      )}
      onClick={onClick}
      ref={forwardedRef}
      {...remainingProps}
    >
      <Icon className="m-dock-item__icon" name={icon} />
      <div className="m-dock-item__label">
        {label}
      </div>
      {badge && (
        <Badge
          className={classNames(
            { 'm-dock-item__badge': badgeProps.type === 'default' },
          )}
          position={{ top: '0.5rem', right: '0.5rem' }}
          {...badgeProps}
        >
          {badge}
        </Badge>
      )}
    </Tappable>
  );
}

DockItem.propTypes = {
  badge: PropTypes.node,
  badgeProps: PropTypes.object.isRequired,
  icon: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  label: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

export default forwardRef(DockItem);
