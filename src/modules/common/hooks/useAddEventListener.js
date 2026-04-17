import { useEffect } from 'react';

function useAddEventListener({ eventType, callback }) {
  useEffect(() => {
    window.addEventListener(
      eventType, callback,
    );

    return () => {
      window.removeEventListener(
        eventType, callback,
      );
    };
  }, [callback, eventType]);
}

export default useAddEventListener;
