import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  ONE_DAY,
  ONE_HOUR,
  ONE_MINUTE,
  ONE_SECOND,
} from '@common/utils/date';

function CountDown({
  time, format = CountDown.TIMER, className, currentTime,
}) {
  const TimeCell = ({ timeLeft, text }) => (
    <div>
      <span>
        {timeLeft.toString().padStart(2, 0)}
      </span>
      <span>
        {text}
      </span>
    </div>
  );

  /**
   * Returns formatted text depending on the amount of time left
   *
   * @param {Integer|MS} diff
   * @param {String} mode
   */
  function getTimerText(diff, mode) {
    let daysLeft = Math.floor(diff / ONE_DAY);
    let fullHours = Math.floor(diff / ONE_HOUR);
    let hoursLeft = Math.floor((diff % ONE_DAY) / ONE_HOUR);
    let minutesLeft = Math.floor((diff % ONE_HOUR) / ONE_MINUTE);
    let secondsLeft = Math.floor((diff % ONE_MINUTE) / ONE_SECOND);
    let isPast = false;

    if (secondsLeft < 0) {
      isPast = true;
      fullHours *= -1;
      daysLeft *= -1;
      hoursLeft *= -1;
      minutesLeft *= -1;
      secondsLeft *= -1;
    }

    if (mode === CountDown.TEXT) {
      const suffixText = isPast ? 'ago' : 'left';
      if (diff > ONE_DAY) {
        return `${daysLeft} days ${suffixText}`;
      } else if (diff > ONE_HOUR) {
        return `${hoursLeft} hours ${suffixText}`;
      } else if (diff > ONE_MINUTE) {
        return `${minutesLeft} minutes ${suffixText}`;
      } else if (diff > ONE_SECOND) {
        return `${secondsLeft} seconds ${suffixText}`;
      }
    }

    if (mode === CountDown.TIMER) {
      return [
        `${isPast ? '-' : ''}${fullHours.toString().padStart(2, 0)}`,
        `${minutesLeft.toString().padStart(2, 0)}`,
        `${secondsLeft.toString().padStart(2, 0)}`,
      ].join(':');
    }

    if (mode === CountDown.TIMER_WITHOUT_PAST) {
      if (isPast) {
        return '00:00:00';
      } else {
        return [
          `${hoursLeft.toString().padStart(2, 0)}`,
          `${minutesLeft.toString().padStart(2, 0)}`,
          `${secondsLeft.toString().padStart(2, 0)}`,
        ].join(':');
      }
    }

    if (mode === CountDown.TIMER_WITHOUT_PAST_WHOLE) {
      if (isPast) {
        return '00:00:00';
      } else {
        return [
          `${fullHours.toString().padStart(2, 0)}`,
          `${minutesLeft.toString().padStart(2, 0)}`,
          `${secondsLeft.toString().padStart(2, 0)}`,
        ].join(':');
      }
    }

    if (mode === CountDown.TIMER_WITH_NOTATION) {
      return [
        `${isPast ? '-' : ''}${fullHours.toString().padStart(2, 0)}h`,
        `${minutesLeft.toString().padStart(2, 0)}m`,
        `${secondsLeft.toString().padStart(2, 0)}s`,
      ].join(':');
    }

    if (mode === CountDown.STYLEABLE_TIMER) {
      return (
        <div className={classNames({ [className]: className })}>
          { daysLeft > 0 && <TimeCell timeLeft={daysLeft} text="Days" /> }
          { hoursLeft > 0 && <TimeCell timeLeft={hoursLeft} text="Hrs" /> }
          { <TimeCell timeLeft={minutesLeft} text="Mins" /> }
          { daysLeft === 0 && <TimeCell timeLeft={secondsLeft} text="Secs" /> }
        </div>
      );
    }

    if (mode === CountDown.COMPACT_STYLEABLE_TIMER) {
      return (
        <div className={classNames({ [className]: className })}>
          { daysLeft > 0 && <TimeCell timeLeft={daysLeft} text="d" /> }
          { hoursLeft > 0 && <TimeCell timeLeft={hoursLeft} text="h" /> }
          { <TimeCell timeLeft={minutesLeft} text="m" /> }
          { <TimeCell timeLeft={secondsLeft} text="s" /> }
        </div>
      );
    }

    if (mode === CountDown.COMPACT_STYLEABLE_TIMER_WITHOUT_SEC) {
      return (
        <div className={classNames({ [className]: className })}>
          { daysLeft > 0 && <TimeCell timeLeft={daysLeft} text="d" /> }
          { hoursLeft > 0 && <TimeCell timeLeft={hoursLeft} text="h" /> }
          { <TimeCell timeLeft={minutesLeft} text="m" /> }
        </div>
      );
    }

    if (mode === CountDown.STYLEABLE_TIMER_WITHOUT_PAST) {
      return (
        <div className={classNames({ [className]: className })}>
          { !isPast && daysLeft >= 1
            ? <TimeCell timeLeft={daysLeft} text="d" />
            : '' }
          { isPast
            ? <TimeCell timeLeft="00" text="h" />
            : <TimeCell timeLeft={hoursLeft} text="h" /> }
          { isPast
            ? <TimeCell timeLeft="00" text="m" />
            : <TimeCell timeLeft={minutesLeft} text="m" /> }
          { isPast
            ? <TimeCell timeLeft="00" text="s" />
            : <TimeCell timeLeft={secondsLeft} text="s" /> }
        </div>
      );
    }

    if (mode === CountDown.STYLEABLE_HOUR_MIN_TIMER) {
      return (
        <div className={classNames({ [className]: className })}>
          {<TimeCell timeLeft={fullHours} text="h" />}
          { ':' }
          { <TimeCell timeLeft={minutesLeft} text="m" /> }
        </div>
      );
    }

    // Empty string otherwise
    return '';
  }

  const targetTime = new Date(time);
  const startTime = new Date(currentTime || new Date().toUTCString());
  const defaultText = getTimerText(targetTime - startTime, format);
  const [timerText, setTimerText] = useState(defaultText);

  useEffect(() => {
    const endTime = new Date(time);
    const newTime = new Date(currentTime || new Date().toUTCString());

    const interval = setInterval(() => {
      newTime.setSeconds(newTime.getSeconds() + 1);
      let remainingTime = endTime - newTime;

      if (remainingTime <= 0) {
        remainingTime = 0;
        clearInterval(interval);
      }

      setTimerText(() => getTimerText(remainingTime, format));
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, time, currentTime]);

  /* istanbul ignore next */
  if (!targetTime) return null;

  return (
    <>
      {timerText}
    </>
  );
}

CountDown.TIMER = 'COUNT_DOWN_TIMER';
CountDown.TIMER_WITHOUT_PAST = 'COUNT_DOWN_TIMER_WITHOUT_PAST';
CountDown.TIMER_WITHOUT_PAST_WHOLE = 'COUNT_DOWN_TIMER_WITHOUT_PAST_WHOLE';
CountDown.TIMER_WITH_NOTATION = 'COUNT_DOWN_TIMER_NOTATION';
CountDown.TEXT = 'COUNT_DOWN_TEXT';
CountDown.STYLEABLE_TIMER = 'COUNT_DOWN_STYLEABLE_TIMER';
CountDown.COMPACT_STYLEABLE_TIMER = 'COMPACT_COUNT_DOWN_STYLEABLE_TIMER';
// eslint-disable-next-line max-len
CountDown.COMPACT_STYLEABLE_TIMER_WITHOUT_SEC = 'COMPACT_STYLEABLE_TIMER_WITHOUT_SEC';
// eslint-disable-next-line max-len
CountDown.STYLEABLE_TIMER_WITHOUT_PAST = 'COUNT_DOWN_STYLEABLE_TIMER_WITHOUT_PAST';
CountDown.STYLEABLE_HOUR_MIN_TIMER = 'STYLEABLE_HOUR_MIN_TIMER';

CountDown.propTypes = {
  time: PropTypes.string.isRequired,
  format: PropTypes.oneOf([
    CountDown.TEXT,
    CountDown.TIMER,
    CountDown.TIMER_WITH_NOTATION,
    CountDown.STYLEABLE_TIMER,
    CountDown.TIMER_WITHOUT_PAST,
    CountDown.TIMER_WITHOUT_PAST_WHOLE,
    CountDown.STYLEABLE_TIMER_WITHOUT_PAST,
    CountDown.COMPACT_STYLEABLE_TIMER,
    CountDown.COMPACT_STYLEABLE_TIMER_WITHOUT_SEC,
    CountDown.STYLEABLE_HOUR_MIN_TIMER,
  ]),
  currentTime: PropTypes.string,
};

export default CountDown;
