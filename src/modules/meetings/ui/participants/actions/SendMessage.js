import React, { useCallback } from 'react';

import { Icon, Tappable, Tooltip } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';

function SendMessage({ meetingStore, userId }) {
  const { meeting } = meetingStore;

  const handleSendMessage = useCallback(() => {
    meeting.messaging.setMessageToId(userId);
  }, [meeting.messaging, userId]);

  if (meeting && meeting.messaging) {
    const { messaging } = meeting;
    if (messaging.sendToUserIds.has(userId)) {
      return (
        <Tooltip
          className="
            participant-action
            participant-action--main
            participant-action--primary
            participant-action--small
          "
          component={Tappable}
          onClick={handleSendMessage}
          title="Click to send message"
        >
          <Icon name="chat" />
        </Tooltip>
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(SendMessage);
