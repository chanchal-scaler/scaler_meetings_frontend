import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

function PageViewTracking(
  {
    allowPageTracking = true,
    ...rest
  },
  extraDeps = [],
) {
  const location = useLocation();

  const sendGtmData = useCallback(() => {
    if (allowPageTracking) {
      window.GTMtracker?.trackEvent(
        'pageViewFormatter',
        {
          location,
          ...rest,
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowPageTracking, location, ...extraDeps]);

  useEffect(() => {
    sendGtmData();
  }, [sendGtmData]);
}

export default PageViewTracking;
