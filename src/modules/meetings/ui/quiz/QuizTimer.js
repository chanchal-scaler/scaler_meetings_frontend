import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Icon } from '@common/ui/general';

function QuizTimer({
  className,
  isEnded,
  timeLeft,
  ...remainingProps
}) {
  function timeUi() {
    if (timeLeft <= 0 || isEnded) {
      return `Quiz Ended!`;
    } else {
      return `Time Left: ${parseInt(timeLeft / 1000, 10)}s`;
    }
  }

  return (
    <div
      className={classNames(
        'm-quiz-timer',
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

QuizTimer.propTypes = {
  isEnded: PropTypes.bool,
  timeLeft: PropTypes.number.isRequired,
};

export default QuizTimer;
