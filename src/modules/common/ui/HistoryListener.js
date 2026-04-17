import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { isScaler } from '@common/utils/environment';
import { isFunction } from '@common/utils/type';
import analytics from '@common/utils/analytics';

function trackPageView() {
  setTimeout(() => analytics.pageview(), 0);
}

function HistoryListener(
  {
    children,
    onLocationChange,
    allowPageTracking = true,
  },
) {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    if (allowPageTracking) {
      trackPageView();
      window.GTMtracker?.trackEvent('pageViewFormatter', { location });
    }

    if (window.storeEsEvent) {
      window.storeEsEvent('page-view-tracker', 'click', location.pathname);
    }

    if (window.ga && allowPageTracking) {
      const gaPrefix = isScaler() ? 'gtm1.' : '';
      window.ga(`${gaPrefix}set`, 'page', location.pathname + location.search);
      window.ga(`${gaPrefix}send`, 'pageview');
    }

    if (isFunction(onLocationChange)) {
      onLocationChange(location);
    }
  }, [location, allowPageTracking, onLocationChange]);

  return (
    <>{children}</>
  );
}

export default HistoryListener;
