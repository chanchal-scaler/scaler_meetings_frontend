import React from 'react';

import { withGTMTracking } from '@common/ui/hoc';

function GTMTracking({
  className,
  component,
  ...remainingProps
}) {
  return React.createElement(
    component,
    {
      displayName: 'GTMTracking',
      className,
      ...remainingProps,
    },
  );
}

export default withGTMTracking(GTMTracking);
