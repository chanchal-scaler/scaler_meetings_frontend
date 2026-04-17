import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';

import { ONE_MONTH } from '@common/utils/date';
import { useCollapsable } from '@common/hooks';
import Icon from './Icon';
import Tappable from './Tappable';

function TimezoneMismatchWarning({
  timezoneOffset, timezoneString, className,
}) {
  const [showTimezoneWarning, setShowTimezoneWarning] = useState(false);

  const [timezoneWarning, onClose] = useCollapsable({
    key: 'timezoneMismatchWarning',
    numCloses: Number.MAX_SAFE_INTEGER,
    minInterval: ONE_MONTH,
  });

  useEffect(() => {
    const broswerOffset = new Date().getTimezoneOffset();
    if (timezoneOffset && (broswerOffset * -1 !== timezoneOffset)) {
      setShowTimezoneWarning(true);
    }
  }, [timezoneOffset]);

  const handleTimezoneWarningClose = useCallback(() => {
    setShowTimezoneWarning(false);
    onClose();
  }, [onClose]);

  if (showTimezoneWarning && timezoneWarning) {
    return (
      <div className={
        classNames(
          { [className]: className },
        )
      }
      >
        <div className="row align-c">
          <div>
            The selected Time Zone
            {' '}
            {timezoneString}
            {' '}
            is different from your system time. Please check it again
          </div>
          <a href="/settings/scaler" className="m-h-20 link">
            Change Timezone
          </a>
        </div>
        <Tappable
          name="close"
          className="bold h5 no-highlight"
          onClick={handleTimezoneWarningClose}
          component={Icon}
        />
      </div>
    );
  } else {
    return null;
  }
}

export default TimezoneMismatchWarning;
