import React from 'react';

import { isFunction } from '@common/utils/type';
import { mobxify } from '~meetings/ui/hoc';

function CustomHeaderActions({ meetingStore, actions, mode }) {
  if (!actions) return null;

  return (
    <>
      {actions.map((action, index) => (
        <div
          className="m-btn m-btn--default m-header__action"
          key={`custom-header-action-${index}`}
        >
          {isFunction(action) ? action({ store: meetingStore, mode }) : action}
        </div>
      ))}
    </>
  );
}

export default mobxify('meetingStore')(CustomHeaderActions);
