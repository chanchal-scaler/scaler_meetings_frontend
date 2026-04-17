import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import Select from 'react-select';

import { Tappable } from '@common/ui/general';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { toDatePickerFormat } from '@common/utils/date';

function MentorReschedule({ plugin }) {
  const { state } = plugin;
  const {
    sessionData,
    mentor,
  } = state;

  const {
    isLoading,
    loadError,
    slotsForSelect,
    selectedDate,
    selectedTime,
  } = mentor;

  const minDate = toDatePickerFormat(new Date()).split('T')[0];

  useEffect(() => {
    plugin.loadMentorData();
  }, [plugin]);

  function headerUI() {
    return (
      <div className="reschedule__header">
        <div className="h3 bold dark">
          Please select date and time
        </div>
        <div>
          {`Timezone: `}
          {sessionData.timezone}
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
        actionFn={() => plugin.loadMentorData()}
        message="Failed to load mentor time slots"
      />
    );
  } else if (slotsForSelect) {
    return (
      <div>
        {headerUI()}
        <div className="resc-timeslots__date-container">
          <div className="h3 bold m-b-5">Date</div>
          <input
            type="date"
            min={minDate}
            className="resc-timeslots__date-picker"
            onChange={(e) => plugin.updateMentorSelectedDate(e.target.value)}
          />
        </div>
        <div className="resc-timeslots__time-container">
          <div className="h3 bold m-b-5">Time</div>
          <Select
            options={slotsForSelect}
            classNamePrefix="resc-timeslots__select"
            placeholder="Select time"
            onChange={(selected) => plugin.updateMentorSelectedTime(selected)}
          />
        </div>
        <div className="resc-timeslots__button-container">
          <Tappable
            className="btn btn-primary bold"
            disabled={!(selectedDate && selectedTime)}
            onClick={() => plugin.rescheduleSessionFromMentor()}
          >
            Reschedule Session
          </Tappable>
        </div>
      </div>
    );
  }
}

export default observer(MentorReschedule);
