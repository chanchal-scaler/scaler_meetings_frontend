import { useEffect, useState } from 'react';

/**
 * @param {object} param
 * @param {object} param.callback Function to execute after component is viewed
 */
function useComponentOnScreen(ref) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return undefined;

    const isIntersectionObserverNotSupported = (
      !('IntersectionObserver' in window)
      || !('IntersectionObserverEntry' in window)
      || !('intersectionRatio' in window.IntersectionObserverEntry.prototype)
    );

    if (isIntersectionObserverNotSupported) {
      setIsVisible(true);
      return undefined;
    } else {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      }, {});
      observer.observe(ref.current);

      return () => observer.disconnect();
    }
  }, [ref]);

  return [isVisible];
}

export default useComponentOnScreen;
