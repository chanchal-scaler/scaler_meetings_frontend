import { useEffect } from 'react';

import { trackGAEvent } from '@common/utils/ga';

/**
 *
 * @param {String} hitType - not-required (defaults to "event")
 * @param {String} category - required
 * @param {String} action - required
 * @param {String} label - not-required
 * @param {Int} value - not-required
 */
function useGATracking({
  hitType,
  category,
  action,
  label,
  value,
}) {
  useEffect(() => {
    trackGAEvent({
      hitType, category, action, label, value,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useGATracking;
