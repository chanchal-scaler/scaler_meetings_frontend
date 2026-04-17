import React from 'react';

import ChatCooldown from './ChatCooldown';
import ChatPermissions from './ChatPermissions';
import MultiScreenShare from './MultiScreenShare';
import QuestionsToggle from './QuestionsToggle';
import UnmutePermissions from './UnmutePermissions';

function AdminSettings() {
  return (
    <div className="form">
      <ChatPermissions />
      <QuestionsToggle />
      <UnmutePermissions />
      <ChatCooldown />
      <MultiScreenShare />
    </div>
  );
}

export default AdminSettings;
