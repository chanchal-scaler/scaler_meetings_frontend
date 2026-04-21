import {
  useCallback, useState, useRef, useEffect,
} from 'react';

import useComponentOnScreen from './useComponentOnScreen';
import LocalStorage from '@common/lib/localStorage';

const ls = LocalStorage.getInstance('__ROLLING_VIEWS__');

/**
 * @param {object} param
 * @param {String} param.key - Name of the key
 * @param {String} param.minInterval - Minimum time to calculate the view count
 * @param {Array} [param.views] - List of components
 * @param {String} param.viewsCountLimit - Limit to render next component
 * @param {boolean} [param.skipRolling=true] - True by default
 * @param {boolean} [param.isCircular=true] - true by default
 */

function useRollingViews(config, skipRolling = true) {
  const {
    key,
    minInterval,
    views,
    viewsCountLimit,
    isCircular,
  } = config;

  const ref = useRef(null);
  const [isComponentVisible] = useComponentOnScreen(ref);
  const [currView, setCurrView] = useState(null);

  const increaseView = useCallback(() => {
    const { count, currViewIndex, lastViewTime } = ls[key];

    /* Compare with lastViewed time */
    const todaysDate = new Date();
    const lastClosedDate = new Date(lastViewTime);
    const timeDiff = todaysDate.getTime() - lastClosedDate.getTime();

    if (timeDiff > minInterval) {
      /* When All the components are viewed */
    // Check if the count of views exceeds the allowed limit.
    // If so, take appropriate action based on isCircular flag.
      if (count >= views.length * viewsCountLimit) {
        if (isCircular) {
        // If isCircular, reset the views and start over.
        // Reset the local storage data for the current key.
          ls[key] = {
            count: 0,
            currViewIndex: 0,
            lastViewTime: new Date(),
          };
          // Set the current view to the first one.
          setCurrView(0);
        } else {
        // If not isCircular, set the current view to -1
        // (indicating an invalid state) and return undefined.
          setCurrView(-1);
          return undefined;
        }
      } else if ((count > 0)
      && (count % viewsCountLimit === 0)) {
        /* Increase the currentViewIndex (component's array index) */
        ls[key] = {
          count: count + 1,
          currViewIndex: currViewIndex + 1,
          lastViewTime: todaysDate,
        };
        setCurrView(currViewIndex + 1);
      } else {
        /* Increase the count (component's view count) */
        ls[key] = {
          count: count + 1,
          currViewIndex,
          lastViewTime: todaysDate,
        };
      }
    }
    return undefined;
  }, [isCircular, key, minInterval, views.length, viewsCountLimit]);

  useEffect(() => {
    if (isComponentVisible) {
      increaseView();
    }
  }, [isComponentVisible, increaseView]);

  useEffect(() => {
    if (views.length === 0 || !skipRolling) {
      setCurrView(-1);
    } else if (!ls[key]) {
      ls[key] = { count: 0, currViewIndex: 0, lastViewTime: new Date() };
      setCurrView(0);
    } else {
      setCurrView(ls[key]?.currViewIndex);
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipRolling]);

  return [views[currView], ref];
}

export default useRollingViews;
