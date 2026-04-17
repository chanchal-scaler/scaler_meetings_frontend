import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll to top when route changes
 */
const useRouterScrollToTop = (disabled = false) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!disabled) {
      window.scrollTo(0, 0);
    }
  }, [disabled, pathname]);
};

export default useRouterScrollToTop;
