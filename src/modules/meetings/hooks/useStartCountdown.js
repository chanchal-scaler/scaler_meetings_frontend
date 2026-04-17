import { useEffect, useState } from 'react';

import { toTimeUnits } from '@common/utils/date';

function useStartCountdown(store) {
  const [timer, setTimer] = useState([0, 0, 0, 0]);
  const { data } = store;

  useEffect(() => {
    const interval = setInterval(() => {
      const milliseconds = (
        Date.parse(data.start_time)
        - Date.now()
        + (data.delay_time * 1000)
      );
      const units = toTimeUnits(milliseconds);
      setTimer(units);
      if (milliseconds < 1000) {
        clearInterval(interval);
        store.checkForUpdate();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(store.pollTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.start_time]);

  return timer;
}

export default useStartCountdown;
