import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Icon } from '@common/ui/general';

function PollTimer({
  className,
  isEnded,
  timeLeft,
  ...remainingProps
}) {
  function timeUi() {
    if (timeLeft <= 0 || isEnded) {
      return `Poll Ended!`;
    } else {
      return `Time Left: ${parseInt(timeLeft / 1000, 10)}s`;
    }
  }

  return (
    <div
      className={classNames(
        'm-poll-timer',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <Icon
        className="m-r-10"
        name="clock"
      />
      <span className="bold">
        {timeUi()}
      </span>
    </div>
  );
}

PollTimer.propTypes = {
  isEnded: PropTypes.bool,
  timeLeft: PropTypes.number.isRequired,
};

export default PollTimer;
