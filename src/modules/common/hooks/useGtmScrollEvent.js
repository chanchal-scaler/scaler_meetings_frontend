/* eslint-disable max-len */
import { useRef, useEffect, useCallback } from 'react';

import { trackScrollHandler } from '@tracking/components/handlers/scroll';

/**
 * useGtmScrollEvent - A hook to register gtm scroll event handler on a dom element
 * It will track scroll event for that particular dom element.
 *
 * ** Important - it will not trigger any intersection scroll gtm events **
 * ** Important - This hook has dependency on tracking app **
 *
 * @param {string} elementSelector css selector for selecting element whose scroll will be observerd
 * @param {boolean} [true] isVertical - handle vertical or horizontal scroll
 */
function useGtmScrollEvent({ elementSelector, isVertical = true }) {
  const gtmEventHandler = useRef(trackScrollHandler(isVertical));

  const scrollEventListener = useCallback(
    (event) => requestAnimationFrame(() => gtmEventHandler?.current(event)),
    [gtmEventHandler],
  );

  useEffect(() => {
    const currentElement = document.getElementById(elementSelector);

    if (currentElement) currentElement.addEventListener('scroll', scrollEventListener);

    return () => {
      if (currentElement) currentElement.removeEventListener('scroll', scrollEventListener);
    };
  }, [elementSelector, scrollEventListener]);
}

export default useGtmScrollEvent;
