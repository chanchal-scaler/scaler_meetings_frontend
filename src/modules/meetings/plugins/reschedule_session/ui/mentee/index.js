import React, { useEffect } from 'react';
import { observer } from 'mobx-react';

import { Tappable } from '@common/ui/general';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';

import TimeSlotsUi from './timeSlots';

function MenteeReschedule({ plugin }) {
  const { state } = plugin;
  const {
    sessionData,
    mentee,
  } = state;

  const {
    isLoading,
    loadError,
    mentorTimeSlots,
  } = mentee;

  useEffect(() => {
    plugin.loadMenteeData();
  }, [plugin]);

  function headerUI() {
    return (
      <div className="reschedule__header">
        <div className="h3 bold dark">
          Please select the time slot
        </div>
        <div>
          {`Timezone: `}
          {sessionData.timezone}
        </div>
      </div>
    );
  }

  function noTimeSlotsUi() {
    return (
      <div className="p-10 m-t-10">
        <div className="h3 bold">
          All your mentor's timeslots have been exhausted.
          Please request more.
        </div>
        <div className="m-t-10">
          <Tappable
            onClick={() => plugin.requestMoreTimeSlotsFromMentor()}
            className="btn btn-primary"
          >
            Request Timeslots from Mentor
          </Tappable>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (<LoadingLayout />);
  } else if (loadError) {
    return (
      <HintLayout
        actionLabel="Try again"
        actionFn={() => plugin.loadMenteeData()}
        message="Failed to load mentor time slots"
      />
    );
  } else if (mentorTimeSlots) {
    return (
      <div>
        {headerUI()}
        {mentorTimeSlots.length === 0
          ? noTimeSlotsUi()
          : <TimeSlotsUi plugin={plugin} />}
      </div>
    );
  } else return null;
}

export default observer(MenteeReschedule);
