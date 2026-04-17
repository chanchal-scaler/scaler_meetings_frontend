import React from 'react';

import { ConnectionStatus } from '~meetings/ui/general';

/*
  * This error is raised when:
  * 1. User initiates the screen share
  * 2. A pop-up opens up asking which window/tab the user wants to share
  * 3. User clicks on cancel button in the pop-up
*/
const PermissionDeniedUserError = ({ actionFn }) => (
  <ConnectionStatus
    actionFn={actionFn}
    actionLabel="Close"
    message="Screen sharing cancelled."
    type="info"
  />
);

export default PermissionDeniedUserError;
