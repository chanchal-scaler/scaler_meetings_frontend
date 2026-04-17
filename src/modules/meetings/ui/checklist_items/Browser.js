import React from 'react';

import { CHECKLIST_ITEM_STATUSES } from '~meetings/utils/constants';
import { isChrome } from '@common/utils/platform';
import ChecklistTemplate from './ChecklistTemplate';

export default function Device({ shouldRender = true }) {
  const status = (
    isChrome()
      ? CHECKLIST_ITEM_STATUSES.success
      : CHECKLIST_ITEM_STATUSES.warning
  );
  if (shouldRender) {
    return (
      <ChecklistTemplate status={status}>
        <div className="h5 column">
          <span className="hint">For better experience</span>
          <span className="bold">switch to chrome</span>
        </div>
      </ChecklistTemplate>
    );
  } else {
    return null;
  }
}
