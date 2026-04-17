import { useCallback, useEffect, useState } from 'react';

import LocalStorage from '@common/lib/localStorage';

const ls = LocalStorage.getInstance('__IB_COLLAPSE__');

function useCollapsable({
  key,
  minInterval = 24 * 60 * 60 * 1000,
  numCloses,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [totalCloses, setTotalCloses] = useState(0);
  const [lastClose, setLastClose] = useState(new Date(0));

  useEffect(() => {
    const config = ls[key] || { closes: 0, lastClose: new Date(0) };
    const todaysDate = new Date();
    const lastClosedDate = new Date(config.lastClose);
    if (
      key
      && config.closes < numCloses
      && (todaysDate.getTime() - lastClosedDate.getTime()) > minInterval
    ) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
    setTotalCloses(config.closes);
    setLastClose(lastClosedDate);
  }, [numCloses, minInterval, key]);

  const onClose = useCallback(() => {
    const todaysDate = new Date();
    ls[key] = {
      lastClose: todaysDate,
      closes: ls[key] ? (ls[key].closes + 1) : 1,
    };
    setTotalCloses(ls[key].closes);
    setIsVisible(false);
    setLastClose(todaysDate);
  }, [key]);

  return [
    isVisible,
    onClose,
    totalCloses,
    lastClose,
  ];
}

export default useCollapsable;
