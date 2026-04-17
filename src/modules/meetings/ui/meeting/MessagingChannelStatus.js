import React from 'react';

import { ConnectionStatus } from '~meetings/ui/general';
import { DRONA_TROUBLESHOOTING_GUIDE_URL } from '~meetings/utils/constants';
import { MessagingConnectionStates } from '~meetings/utils/messagingConnection';
import { mobxify } from '~meetings/ui/hoc';

const messagesMap = {
  [MessagingConnectionStates.reconnecting]: 'Connection interrupted',
  [MessagingConnectionStates.failed]: 'Failed to connect to chat',
  [MessagingConnectionStates.unauthorised]: 'Unable to authenticate',
  [MessagingConnectionStates.rejected]: 'Logged in from some other device',
};

function MessagingChannelStatus({ meetingStore: store }) {
  const { messaging } = store.meeting;

  switch (messaging.connectionState) {
    case MessagingConnectionStates.failed:
    case MessagingConnectionStates.unauthorised:
    case MessagingConnectionStates.rejected:
      return (
        <ConnectionStatus
          actionFn={() => window.location.reload()}
          actionLabel="Reload"
          guideUrl={DRONA_TROUBLESHOOTING_GUIDE_URL}
          message={messagesMap[messaging.connectionState]}
          type="error"
        />
      );
    default:
      return null;
  }
}

export default mobxify('meetingStore')(MessagingChannelStatus);
