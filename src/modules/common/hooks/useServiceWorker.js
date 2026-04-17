import { useCallback, useEffect } from 'react';

function useServiceWorker(appName) {
  const registerServiceWorker = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register(`/workers/${appName}.js`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`failed to register servier worker for ${appName}`);
    }
  }, [appName]);

  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);
}

export default useServiceWorker;
