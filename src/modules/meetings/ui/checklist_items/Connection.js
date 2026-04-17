import React from 'react';

import { CHECKLIST_ITEM_STATUSES } from '~meetings/utils/constants';
import ChecklistTemplate from './ChecklistTemplate';

export default function Connection() {
  return (
    <ChecklistTemplate status={CHECKLIST_ITEM_STATUSES.success}>
      <div className="h5 column">
        <span className="hint">Stable network with</span>
        <span className="bold">{'>500kbps speed'}</span>
      </div>
    </ChecklistTemplate>
  );
}
