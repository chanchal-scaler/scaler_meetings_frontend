import { useCallback } from 'react';
import throttle from 'lodash/throttle';

function useThrottled(fn, wait, deps) {
  return useCallback(
    throttle(fn, wait, { trailing: true, leading: false }),
    deps,
  );
}

export default useThrottled;
