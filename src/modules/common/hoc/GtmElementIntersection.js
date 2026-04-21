/* eslint-disable max-len */
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useLayoutEffect,
  useMemo,
} from 'react';

import { setupIntersectionObserver } from '@tracking/components/handlers/scroll';

const GtmElementIntersectionContext = createContext(undefined);

/**
 * GtmElementIntersectionProvider is HOC which provides all its childrens.
 * observeElement and unobserveElement methods through GtmElementIntersectionContext context .
 * It is used for providing GTM scroll interaction event functionality to dom elements.
 * scrollableParentId should be a valid css id selector else observer will not be created
 *
 * ** Important - This HOC has dependency on tracking app **
 *
 * @param {JSX Element} children
 * @param {boolean} [isVertical=true] - To track veritcal/horizonatl scroll
 * @param {string} [scrollableParent="nux-tour-container"] - Ancestor used for calculating scroll percentage and scroll diff for a scroll event
 *
 * @return HOC for prodving gtm scroll interaction event functionality
 */

export default function GtmElementIntersectionProvider({
  children,
  isVertical = true,
  scrollableAncestor,
}) {
  const intersectionObserver = useRef(null);

  useLayoutEffect(() => {
    const parentElement = scrollableAncestor || document.documentElement;

    if (parentElement) {
      intersectionObserver.current = setupIntersectionObserver(
        parentElement,
        isVertical,
      );
    }

    return () => {
      if (intersectionObserver.current?.disconnect) {
        intersectionObserver.current.disconnect();
      }
      intersectionObserver.current = null;
    };
  }, [scrollableAncestor, isVertical]);

  const observeElement = useCallback((elementRef) => {
    const currentObserver = intersectionObserver.current;

    if (!elementRef || !currentObserver) return false;

    currentObserver.observe(elementRef);
    return true;
  }, []);

  const unobserveElement = useCallback((elementRef) => {
    const currentObserver = intersectionObserver.current;

    if (!elementRef || !currentObserver) return false;

    currentObserver.unobserve(elementRef);
    return true;
  }, []);

  const contextValue = useMemo(() => ({
    observeElement,
    unobserveElement,
  }), [observeElement, unobserveElement]);

  return (
    <GtmElementIntersectionContext.Provider value={contextValue}>
      {children}
    </GtmElementIntersectionContext.Provider>
  );
}

/**
 * useGtmElementIntersectionContext utility function for execssing GtmElementIntersectionContext.
 *
 * @return GtmElementIntersectionContext object
 */
export function useGtmElementIntersectionContext() {
  const context = useContext(GtmElementIntersectionContext);
  return context;
}
