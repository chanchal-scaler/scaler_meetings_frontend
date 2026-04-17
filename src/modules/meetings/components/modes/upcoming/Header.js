import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import CustomHeaderActions from '~meetings/ui/CustomHeaderActions';

function Header({ leftActions, className }) {
  return (
    <div className={className}>
      <CustomHeaderActions
        actions={leftActions}
        mode="upcoming"
      />
    </div>
  );
}

export default mobxify('meetingStore')(Header);
