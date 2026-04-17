import React from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { Tappable } from '@common/ui/general';
import { toDDMMMYYYY, toHHmm, toWeekDay } from '@common/utils/date';

function TimeSlotsUi({ plugin }) {
  const { state } = plugin;
  const {
    mentee,
  } = state;

  const {
    mentorTimeSlots,
    selectedDateTime,
  } = mentee;

  return (
    <div className="resc-timeslots__container">
      <div className="resc-timeslots__slots-container">
        {mentorTimeSlots.map(
          (timeSlotsPassed, index) => (
            <div className="m-v-10" key={index}>
              <div className="h4 bold m-b-5">
                {`${toWeekDay(timeSlotsPassed[0])},
                ${toDDMMMYYYY(timeSlotsPassed[0])}`}
              </div>
              {
                timeSlotsPassed[1].slots.map((slot, slotIndex) => (
                  timeSlotsPassed[1].is_available[slotIndex] ? (
                    <Tappable
                      onClick={() => plugin.updateMenteeSelectedTime(slot)}
                      className={classNames(
                        'btn m-5',
                        'resc-timeslots__slot',
                        {
                          'btn-primary': selectedDateTime === slot,
                        },
                      )}
                      key={slotIndex}
                    >
                      {toHHmm(slot)}
                    </Tappable>
                  ) : null))
              }
            </div>
          ),
        )}
      </div>
      <div className="resc-timeslots__footer">
        <Tappable
          className="btn btn-primary bold"
          disabled={!selectedDateTime}
          onClick={() => plugin.rescheduleSessionFromMentee()}
        >
          Reschedule Session
        </Tappable>
      </div>
    </div>
  );
}

export default observer(TimeSlotsUi);
