import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Icon from '@common/ui/general/Icon';
import Badge from '@common/ui/general/Badge';
import { withGTMTracking } from '@common/ui/hoc';

function SidebarItem({
  className,
  component,
  iconName,
  item,
  isNew,
  withBadge,
  isVisible,
  ...remainingProps
}) {
  const sideBarTextClasses = classNames(
    'sidebar__item-text',
    {
      'sidebar__item-text--new': isNew || false,
    },
  );
  return React.createElement(
    component,
    {
      className: classNames(
        'sidebar__item',
        { [className]: className },
      ),
      ...remainingProps,
    },
    [
      iconName
        ? (
          <Icon
            key="icon"
            name={iconName}
            className="sidebar__item-icon"
          >
            {withBadge && (
              <Badge
                position={{ top: '1rem', right: '1rem' }}
                style={{
                  minWidth: '0.5rem', minHeight: '0.5rem', borderRadius: '50%',
                }}
                type="info"
              />
            )}
          </Icon>
        )
        : null,
      <span
        key="label"
        className={classNames(
          'sidebar__item--text',
          { [sideBarTextClasses]: sideBarTextClasses },
        )}
      >
        {item}
      </span>,
    ],
  );
}

SidebarItem.propTypes = {
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  iconName: PropTypes.string,
  item: PropTypes.node.isRequired,
};

export default withGTMTracking(SidebarItem);
