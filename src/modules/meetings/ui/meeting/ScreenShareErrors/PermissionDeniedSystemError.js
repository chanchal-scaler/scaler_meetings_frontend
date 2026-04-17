import React from 'react';

import { ConnectionStatus } from '~meetings/ui/general';
import { DRONA_TROUBLESHOOTING_GUIDE_URL } from '~meetings/utils/constants';

/*
  * This error is raised when:
  * 1. User is using a Mac system and
  * 2. They have not granted screen recording permission in system preferences
*/
const PermissionDeniedSystemError = ({ actionFn }) => (
  <ConnectionStatus
    actionFn={actionFn}
    actionLabel="Open System Preferences"
    guideUrl={DRONA_TROUBLESHOOTING_GUIDE_URL}
    message={`
      Allow screen recording access in system preferences.
      (Revoke and regrant access to browser if already enabled)
    `}
    type="error"
  />
);

export default PermissionDeniedSystemError;
