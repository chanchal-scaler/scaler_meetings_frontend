import React, { useCallback } from 'react';
import { gtmEventHandler } from '@common/utils/gtm';

/**
 * Wraps `onClick/onFocus` function which will fire GTM event as well along
 * with the onClick/onFocus passed.
 */
function withGTMTracking(ForwardedComponent) {
  return function ({
    gtmEventType,
    gtmEventAction,
    gtmEventResult,
    gtmEventCategory,
    gtmEventData = {},
    gtmEventLink,
    onClick,
    onFocus,
    ...remainingProps
  }) {
    const sendGTMEvent = useCallback((action) => {
      if (gtmEventAction === action && gtmEventType) {
        const link = gtmEventLink || gtmEventData.link;
        gtmEventHandler(
          gtmEventType,
          gtmEventResult,
          gtmEventAction,
          gtmEventCategory,
          { ...gtmEventData, link },
        );
      }
    }, [
      gtmEventType,
      gtmEventResult,
      gtmEventAction,
      gtmEventCategory,
      gtmEventData,
      gtmEventLink,
    ]);

    const onClickHandler = useCallback((...args) => {
      sendGTMEvent('click');
      if (onClick) {
        onClick(...args);
      }
    }, [onClick, sendGTMEvent]);

    const onFocusHandler = useCallback((...args) => {
      sendGTMEvent('focus');
      if (onFocus) {
        onFocus(...args);
      }
    }, [onFocus, sendGTMEvent]);

    return (
      <ForwardedComponent
        {...remainingProps}
        onClick={onClickHandler}
        onFocus={onFocusHandler}
      />
    );
  };
}

export default withGTMTracking;
