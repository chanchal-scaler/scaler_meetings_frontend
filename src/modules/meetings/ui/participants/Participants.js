import React, { useCallback } from 'react';
import classNames from 'classnames';

import { Field } from '@common/ui/form';
import {
  CircularLoader,
  Icon,
  Tappable,
  Tooltip,
} from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { STATUS_REFRESH_ENABLED } from '~meetings/utils/messaging';
import ParticipantItem from './ParticipantItem';

function Participants({ meetingStore: store }) {
  const { meeting } = store;
  const { participantSearchTerm } = meeting;

  const handleChange = useCallback(({ target }) => {
    meeting.setParticipantSearchTerm(target.value);
  }, [meeting]);

  function participantUi(participant) {
    if (participant.isLoaded) {
      return (
        <ParticipantItem
          key={participant.userId}
          participant={participant}
        />
      );
    } else {
      return null;
    }
  }

  function activeParticipantsUi() {
    return (
      <>
        <div className="participants__list" data-cy="meetings-participant-list">
          {meeting.filteredParticipants.map(participantUi)}
        </div>
        {!meeting.participantSearchTerm && (
          <div className="hint h5 italic p-10">
            Use the above search box to find a particular person.
            List may not reflect everyone present in the session
          </div>
        )}
      </>
    );
  }

  function bannedParticipantsUi() {
    if (meeting.isSuperHost && meeting.bannedParticipants.length > 0) {
      return (
        <>
          <h5 className="normal m-l-10 m-t-10 no-mgn-b">
            Banned Users
          </h5>
          <div className="participants__list">
            {meeting.bannedParticipants.map(participantUi)}
          </div>
        </>
      );
    } else {
      return null;
    }
  }

  function searchParticipantsUi() {
    const { messaging } = meeting;
    return (
      <div className="form p-h-10">
        <Field className="relative">
          <input
            onChange={handleChange}
            placeholder="Search"
            value={participantSearchTerm}
          />
          {meeting.isSearchingParticipants && (
            <CircularLoader className="participants__refresh" />
          )}
          {
            STATUS_REFRESH_ENABLED
            && meeting.isSuperHost
            && meeting.hasManyParticipants
            && messaging
            && messaging.isLoaded
            && (
              <Tooltip
                className={classNames(
                  'btn btn-inverted btn-icon btn-round',
                  'participants__refresh',
                  {
                    'participants__refresh--loading':
                      messaging.isLoadingStatuses,
                  },
                )}
                component={Tappable}
                disabled={messaging.isLoadingStatuses}
                onClick={() => messaging.setParticipantsStatus()}
                title="Refresh participants list"
              >
                <Icon name="refresh" />
              </Tooltip>
            )
          }
        </Field>
      </div>
    );
  }

  return (
    <div className="layout participants">
      <div className="layout__content">
        {searchParticipantsUi()}
        {activeParticipantsUi()}
        {bannedParticipantsUi()}
      </div>
    </div>
  );
}

export default mobxify('meetingStore')(Participants);
