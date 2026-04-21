/* eslint-disable max-len */
import { useEffect, useRef } from 'react';

import { useGtmElementIntersectionContext } from '@common/hoc/GtmElementIntersection';

/**
 * useGtmScrollIntersection - provides functionality to observer a dom element
 * for triggering GTM scroll intersection events.
 *
 * *** Important - Will only work in combination with GtmElementIntersectionContext ***
 *
 * @returns {object} - a reference should be set on the dom element which the user wants to get observed
 */
function useGtmScrollIntersection() {
  const elementRef = useRef(null);
  const gtmIntersectionContext = useGtmElementIntersectionContext();

  useEffect(() => {
    const _elementRef = elementRef?.current;
    if (_elementRef && gtmIntersectionContext) {
      gtmIntersectionContext.observeElement(_elementRef);
    }

    return () => {
      if (gtmIntersectionContext && _elementRef) {
        gtmIntersectionContext.unobserveElement(_elementRef);
      }
    };
  }, [elementRef, gtmIntersectionContext]);

  return elementRef;
}

export default useGtmScrollIntersection;
