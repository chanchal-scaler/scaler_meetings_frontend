import { useCallback } from 'react';
import debounce from 'lodash/debounce';

function useDebounced(fn, wait, deps) {
  return useCallback(
    debounce(fn, wait, { trailing: true, leading: false }),
    deps,
  );
}

export default useDebounced;
