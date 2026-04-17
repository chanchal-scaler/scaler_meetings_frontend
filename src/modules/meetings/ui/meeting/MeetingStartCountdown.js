import React, { useEffect } from 'react';

import { CountDown, Icon, Tooltip } from '@common/ui/general';
import { meetingTypeLabel } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { useStartCountdown } from '~meetings/hooks';

function MeetingStartCountdown({ meetingStore: store }) {
  useStartCountdown(store);
  const { meeting } = store;

  useEffect(() => () => {
    // Start recording when meeting starts
    if (meeting.recording) {
      meeting.recording.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tooltip
      className="
            m-header__action m-btn m-btn--default row flex-ac
            p-10 warning
          "
      title={
        `${meetingTypeLabel(meeting.type)} will start when the timer ends`
      }
    >
      <Icon
        className="m-r-5"
        name="clock"
      />
      <CountDown
        format={CountDown.TIMER_WITHOUT_PAST}
        time={store.data.start_time}
      />
    </Tooltip>
  );
}

export default mobxify('meetingStore')(MeetingStartCountdown);
