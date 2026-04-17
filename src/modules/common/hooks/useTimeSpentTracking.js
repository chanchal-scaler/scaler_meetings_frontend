import { useCallback, useEffect, useRef } from 'react';

import { isNullOrUndefined } from '@common/utils/type';
import { isWindowHidden } from '@common/utils/browser';
import useVisibilityChange from './useVisibilityChange';

const noop = () => {};

const useTimeSpentTracking = (handler = noop) => {
  const openedAtRef = useRef(Date.now());

  const handleVisibilityChange = useCallback((event) => {
    const timeSpent = Date.now() - openedAtRef.current;
    if (
      (!isNullOrUndefined(event.persisted) && !event.persisted) // Safari
      || isWindowHidden()
    ) {
      handler(timeSpent);
      openedAtRef.current = Date.now();
    } else {
      openedAtRef.current = Date.now();
    }
  }, [handler]);

  useVisibilityChange(handleVisibilityChange);

  useEffect(() => () => handler(Date.now() - openedAtRef.current), [handler]);
};

export default useTimeSpentTracking;
