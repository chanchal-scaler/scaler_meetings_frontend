import React, { useCallback, useEffect, useState } from 'react';

import {
  ONE_HOUR,
  ONE_MINUTE,
  ONE_SECOND,
} from '@common/utils/date';

function CountUp({
  time,
  suffix = ['h', 'm', 's'],
  noSuffix = false,
  seperator = ':',
}) {
  const [suffixes, setSuffixes] = useState(suffix);

  useEffect(() => {
    if (noSuffix) {
      setSuffixes(['', '', '']);
    }
  }, [noSuffix]);

  const getTimerText = useCallback((diff) => {
    const hoursPassed = Math.floor(diff / ONE_HOUR);
    const minutesPassed = Math.floor((diff % ONE_HOUR) / ONE_MINUTE);
    const secondsPassed = Math.floor((diff % ONE_MINUTE) / ONE_SECOND);
    return [
      `${hoursPassed.toString().padStart(2, 0)}${suffixes[0]}`,
      `${minutesPassed.toString().padStart(2, 0)}${suffixes[1]}`,
      `${secondsPassed.toString().padStart(2, 0)}${suffixes[2]}`,
    ].join(seperator);
  }, [suffixes, seperator]);

  const startTime = new Date(time);
  const currentTime = new Date().getTime();
  const defaultText = getTimerText(currentTime - startTime);

  const [timerText, setTimerText] = useState(defaultText);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerText(() => getTimerText(new Date().getTime() - new Date(time)));
    }, 1000);

    return () => clearInterval(interval);
  }, [time, getTimerText]);

  /* istanbul ignore next */
  if (!startTime) return null;

  return (
    <>
      {timerText}
    </>
  );
}
export default CountUp;
