import { useCallback, useEffect, useRef } from 'react';

function useRefCallback(fn) {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  const result = useCallback((...args) => {
    if (ref.current) {
      ref.current(...args);
    }
  }, []);

  return result;
}

export default useRefCallback;
