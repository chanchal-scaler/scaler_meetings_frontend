import React from 'react';

import { CHECKLIST_ITEM_STATUSES } from '~meetings/utils/constants';
import { isMobile } from '@common/utils/platform';
import ChecklistTemplate from './ChecklistTemplate';

export default function Device({ shouldRender = true }) {
  const status = (
    isMobile()
      ? CHECKLIST_ITEM_STATUSES.warning
      : CHECKLIST_ITEM_STATUSES.success
  );
  if (shouldRender) {
    return (
      <ChecklistTemplate status={status}>
        <div className="h5 column">
          <span className="bold">Desktop/Laptop</span>
          <span className="hint">Recommended</span>
        </div>
      </ChecklistTemplate>
    );
  } else {
    return null;
  }
}
