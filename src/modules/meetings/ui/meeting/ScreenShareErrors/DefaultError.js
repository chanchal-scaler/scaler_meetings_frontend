import React from 'react';

import { ConnectionStatus } from '~meetings/ui/general';
import { DRONA_TROUBLESHOOTING_GUIDE_URL } from '~meetings/utils/constants';

const DefaultError = ({ actionFn }) => (
  <ConnectionStatus
    actionFn={actionFn}
    actionLabel="Close"
    guideUrl={DRONA_TROUBLESHOOTING_GUIDE_URL}
    message={`
      System encountered an issue.
      Please try restarting your browser,
      if the issue persists then restart your device.
    `}
    type="error"
  />
);

export default DefaultError;
