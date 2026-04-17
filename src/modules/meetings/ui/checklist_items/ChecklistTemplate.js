import React from 'react';
import classNames from 'classnames';

import { CHECKLIST_ITEM_STATUSES } from '~meetings/utils/constants';
import { Icon } from '@common/ui/general';

export default function ChecklistTemplate({ status, children }) {
  return (
    <div className="m-checklist-item">
      <Icon
        name={classNames(
          { 'tick-circle': status === CHECKLIST_ITEM_STATUSES.success },
          { info: status === CHECKLIST_ITEM_STATUSES.warning },
        )}
        className={classNames(
          'm-checklist-item__icon',
          {
            'm-checklist-item__icon--success': (
              status === CHECKLIST_ITEM_STATUSES.success
            ),
          },
          {
            'm-checklist-item__icon--warning': (
              status === CHECKLIST_ITEM_STATUSES.warning
            ),
          },
        )}
      />
      {children}
    </div>
  );
}
