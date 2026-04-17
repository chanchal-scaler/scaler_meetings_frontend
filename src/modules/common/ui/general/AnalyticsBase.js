import { useLayoutEffect } from 'react';

import analytics, { setLoggedInUser } from '@common/utils/analytics';

/**
 * Use this only inside an app and at most once. Currently used to set the
 * currently active app name so that it can be sent with all events to GTM
 */
function AnalyticsBase({ app, children }) {
  // Using `useLayoutEffect` so that we can set app as early as possible.
  useLayoutEffect(() => {
    analytics.setApp(app);
    analytics.setEnabled(true);
    setLoggedInUser();
  }, [app]);

  return children;
}

export default AnalyticsBase;
