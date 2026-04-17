import React from 'react';

import ChatNotification from './ChatNotification';
import ReactionNotification from './ReactionNotification';

function ChatSettings() {
  return (
    <div className="form">
      <ChatNotification variant="loose" />
      <ReactionNotification />
    </div>
  );
}

export default ChatSettings;
