import { useSyncExternalStore, useCallback, useMemo } from 'react';

import {
  desktopWidth,
  largeDesktopWidth,
  mobileWidth,
  tabletWidth,
} from '@common/utils/constants';

export const MEDIA_QUERIES = {
  mobile: `(max-width: ${mobileWidth}px)`,
  tablet: `(max-width: ${tabletWidth}px)`,
  tabletOnly:
    `(min-width: ${mobileWidth + 1}px) and (max-width: ${tabletWidth}px)`,
  aboveTablet: `(min-width: ${tabletWidth + 1}px)`,
  desktop: `(min-width: ${desktopWidth}px)`,
  smallDesktop: `(max-width: ${largeDesktopWidth}px)`,
};

function useMatchMedia(query) {
  const subscribe = useCallback((callback) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  }, [query]);

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

function useMediaQuery() {
  const entries = useMemo(() => Object.entries(MEDIA_QUERIES), []);

  const results = {};
  for (const [key, query] of entries) {
    results[key] = useMatchMedia(query);
  }
  return results;
}

export default useMediaQuery;
