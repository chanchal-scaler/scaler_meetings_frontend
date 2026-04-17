import { useEffect } from 'react';

const useWindowUnload = (handler) => {
  useEffect(() => {
    window.addEventListener('unload', handler);

    return () => {
      window.removeEventListener('unload', handler);
    };
  }, [handler]);
};

export default useWindowUnload;
