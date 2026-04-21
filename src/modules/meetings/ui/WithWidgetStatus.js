import React from 'react';
import { Observer } from 'mobx-react';

import { canNavigate } from '~meetings/utils/meeting';
import {
  CurrentStatusContext,
} from '~meetings/hooks/useCurrentStatus';
import { mobxify } from '~meetings/ui/hoc';
import { useWidgetData } from '~meetings/hooks';

function WithWidgetStatus({ children, meetingStore: store }) {
  const { status: _status } = useWidgetData();

  const { data } = store;
  const status = canNavigate(data.status, _status, store.isSuperHost)
    ? _status
    : data.status;

  if (status) {
    return (
      <CurrentStatusContext.Provider value={status}>
        <Observer>
          {() => children({ status })}
        </Observer>
      </CurrentStatusContext.Provider>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(WithWidgetStatus);
