import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function TimeElapsed({
  className,
  duration,
  timeElapsed,
  ...remainingProps
}) {
  return (
    <div
      className={classNames(
        'm-time-elapsed',
        { [className]: className },
      )}
      style={{ width: `${(timeElapsed * 100) / duration}%` }}
      {...remainingProps}
    />
  );
}

TimeElapsed.propTypes = {
  duration: PropTypes.number.isRequired,
  timeElapsed: PropTypes.number.isRequired,
};

export default TimeElapsed;
