import React from 'react';

import { CHECKLIST_ITEM_STATUSES } from '~meetings/utils/constants';
import ChecklistTemplate from './ChecklistTemplate';

export default function Device() {
  return (
    <ChecklistTemplate status={CHECKLIST_ITEM_STATUSES.success}>
      <div className="h5 column">
        <span>
          Disable
          {' '}
          <span className="bold">VPN</span>
        </span>
        <span className="hint">
          or
          {' '}
          <span className="bold">Proxy Network</span>
        </span>
      </div>
    </ChecklistTemplate>
  );
}
