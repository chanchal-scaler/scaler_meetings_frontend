import { isSafari } from '@common/utils/platform';
import { useEffect } from 'react';

const useVisibilityChange = (handler) => {
  useEffect(() => {
    document.addEventListener('visibilitychange', handler);
    if (isSafari()) {
      window.addEventListener('pagehide', handler, false);
    }

    return () => {
      document.removeEventListener('visibilitychange', handler);
      if (isSafari()) {
        window.removeEventListener('pagehide', handler);
      }
    };
  }, [handler]);
};

export default useVisibilityChange;
