import { useEffect } from 'react';

const useWindowBeforeUnload = (handler) => {
  useEffect(() => {
    window.addEventListener('beforeunload', handler);

    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [handler]);
};

export default useWindowBeforeUnload;
