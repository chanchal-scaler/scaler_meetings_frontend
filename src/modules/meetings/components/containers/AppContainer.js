import React, { useCallback } from 'react';

import { AnalyticsBase } from '@common/ui/general';
import { AppBase, MeetingProvider } from '~meetings/ui/base';
import analytics from '@common/utils/analytics';

function AppContainer({ children, ...remainingProps }) {
  const handleError = useCallback((error) => {
    analytics.log({
      log_type: 'Drona Error Boundary',
      log_value: error?.message || 'Something went wrong!',
    });
  }, []);

  return (
    <AnalyticsBase app="drona">
      <MeetingProvider {...remainingProps}>
        <AppBase
          onError={handleError}
        >
          {children}
        </AppBase>
      </MeetingProvider>
    </AnalyticsBase>
  );
}

export default AppContainer;
