import { useEffect, useState } from 'react';

export default function useDelayUnmount(isMounted, delayTime) {
  const [showEl, setShowEl] = useState(false);
  useEffect(() => {
    let timeoutId;
    if (isMounted && !showEl) {
      setShowEl(true);
    } else if (!isMounted && showEl) {
      // delay our unmount
      timeoutId = setTimeout(() => setShowEl(false), delayTime);
    }
    return () => clearTimeout(timeoutId);
  }, [isMounted, delayTime, showEl]);
  return showEl;
}
