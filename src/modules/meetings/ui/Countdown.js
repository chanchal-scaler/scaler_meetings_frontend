import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { useStartCountdown } from '~meetings/hooks';

const timerLabels = ['Days', 'Hours', 'Minutes', 'Seconds'];

function Countdown({ meetingStore: store }) {
  const timer = useStartCountdown(store);

  function timerItemUi(value, index) {
    const label = timerLabels[index];

    return (
      <div
        key={index}
        className="m-upcoming-countdown__item"
      >
        <div className="m-upcoming-countdown__value">
          {String(value).padStart(2, '0')}
        </div>
        <div className="m-upcoming-countdown__label">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div className="m-upcoming-countdown">
      {timer.map(timerItemUi)}
    </div>
  );
}

export default mobxify('meetingStore')(Countdown);
