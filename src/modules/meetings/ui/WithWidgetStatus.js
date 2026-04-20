import React, { useEffect, useState } from 'react';
import { Observer } from 'mobx-react';

import { canNavigate } from '~meetings/utils/meeting';
import {
  CurrentStatusContext,
} from '~meetings/hooks/useCurrentStatus';
import { mobxify } from '~meetings/ui/hoc';
import { useWidgetData } from '~meetings/hooks';

function WithWidgetStatus({ children, meetingStore: store }) {
  const [status, setStatus] = useState(null);
  const { status: _status } = useWidgetData();

  const { data } = store;
  useEffect(() => {
    if (canNavigate(data.status, _status, store.isSuperHost)) {
      setStatus(_status);
    } else {
      setStatus(data.status);
    }

    return () => setStatus(null);
  }, [_status, data.status, setStatus, store.isSuperHost]);


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
