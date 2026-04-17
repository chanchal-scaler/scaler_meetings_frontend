import { useCallback } from 'react';

function useStopPropagation() {
  return useCallback((event) => {
    event.stopPropagation();
  }, []);
}

export default useStopPropagation;
