import { useCallback, useEffect, useRef } from 'react';
import camelCase from 'lodash/camelCase';

import LocalStorage from '@common/lib/localStorage';

const ls = LocalStorage.getInstance('__SR_VIEWED_EVENTS__');

/**
 * @param {object} param
 * @param {object} param.analytics Analytics instance for the app.
 * @param {String} param.eventName Name of the view event.
 * @param {String} param.source From where did the view event occur
 * @param {Object} [param.payload] - Addition payload for the event
 * @param {Object} [param.options] - Options for the analytics engine.
 * @param {Object} [param.callback] - Callback to be triggered after
 * @param {Object} [param.unique=true] - If `true` then only track once.
 * @param {Boolean} [param.track=true] - If `true` then only tracking starts
 */
function useComponentViewedTracking({
  analytics, eventName, source, payload, options, callback, unique = true,
  track = true,
}) {
  const ref = useRef(null);

  const handleTracking = useCallback(() => {
    const key = camelCase(eventName);

    if (!unique || !ls[key]) {
      analytics.view(eventName, source, payload, options, callback);
      ls[key] = true;
    }
  }, [analytics, callback, eventName, options, payload, source, unique]);

  useEffect(() => {
    if (!track || !ref.current) return undefined;

    const isIntersectionObserverNotSupported = (
      !('IntersectionObserver' in window)
      || !('IntersectionObserverEntry' in window)
      || !('intersectionRatio' in window.IntersectionObserverEntry.prototype)
    );

    if (isIntersectionObserverNotSupported) {
      handleTracking();

      return undefined;
    } else {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) handleTracking();
      }, {});
      observer.observe(ref.current);

      return () => observer.disconnect();
    }
  }, [handleTracking, track]);

  return ref;
}

export default useComponentViewedTracking;
