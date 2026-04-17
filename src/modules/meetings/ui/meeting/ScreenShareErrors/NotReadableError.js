import React from 'react';

import { ConnectionStatus } from '~meetings/ui/general';
import { DRONA_TROUBLESHOOTING_GUIDE_URL } from '~meetings/utils/constants';

/*
  * This error is raised when:
  * Case 1 (For Mac users):
  *  1. User has not restarted the browser after granting permission
  * Case 2:
  * 1. User device level issue
*/
const NotReadableError = ({ actionFn }) => (
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

export default NotReadableError;
