import { useCallback, useEffect } from 'react';

import { isFunction } from '@common/utils/type';
import HotKey from '@common/lib/hotKey';

function useHotKeys(key, handler) {
  const handleNavigation = useCallback((event) => {
    const hotKey = new HotKey(event);
    if (key && hotKey.didPress(key)) {
      if (isFunction(handler)) {
        handler(key);
        event.preventDefault();
      }
    }
  }, [handler, key]);

  useEffect(() => {
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [handleNavigation]);

  return null;
}

export default useHotKeys;
