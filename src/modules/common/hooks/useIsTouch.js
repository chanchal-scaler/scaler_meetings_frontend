import { useEffect, useState } from 'react';

let isTouchDetected = false;

function useIsTouch() {
  const [isTouch, setTouch] = useState(isTouchDetected);

  useEffect(() => {
    if (isTouchDetected) {
      return undefined;
    }

    const onTouch = () => {
      isTouchDetected = true;
      setTouch(true);
    };

    document.addEventListener(
      'touchstart',
      onTouch,
      { capture: false, once: true },
    );

    return () => document.removeEventListener('touchstart', onTouch);
  }, []);

  return isTouch;
}

export default useIsTouch;
