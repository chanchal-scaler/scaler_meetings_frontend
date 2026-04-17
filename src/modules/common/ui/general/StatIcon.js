import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function StatIcon({
  className,
  icon,
  title,
  value,
  unit,
  // eslint-disable-next-line no-unused-vars
  ...remainingProps
}) {
  return (
    <div className={classNames('stat-icon', { [className]: className })}>
      <div className="stat-icon__icon">
        {icon}
      </div>
      <div className="flex-column">
        <div className="stat-icon__title">
          {title}
        </div>
        <div className="stat-icon__body">
          <span className="stat-icon__value">{value}</span>
          {unit}
        </div>
      </div>
    </div>
  );
}

StatIcon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  unit: PropTypes.string,
};

export default StatIcon;
