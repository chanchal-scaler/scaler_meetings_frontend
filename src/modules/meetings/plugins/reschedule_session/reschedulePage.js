import React, {
  useEffect,
} from 'react';

import { HintLayout, LoadingLayout } from '@common/ui/layouts';

import { mobxify } from '~meetings/ui/hoc';
import MenteeReschedule from '~meetings/plugins/reschedule_session/ui/mentee';
import MentorReschedule from '~meetings/plugins/reschedule_session/ui/mentor';

function ReschedulePage({ meetingStore: store, plugin }) {
  const {
    state,
    isMentee,
  } = plugin;

  const {
    isLoading,
    loadError,
    message,
    bothJoined,
    sessionData,
    allowRedirection,
    redirectionLink,
  } = state;

  useEffect(() => {
    if (store.meeting.activeParticipants
        && store.meeting.activeParticipants.length >= 2
    ) {
      plugin.setBothJoined(true);
    }
  }, [plugin, store.meeting.activeParticipants]);

  useEffect(() => {
    // Redirect to respective dashboard incase rescheduling succeed
    if (allowRedirection) {
      window.location.replace(redirectionLink);
    }
  }, [allowRedirection, redirectionLink]);

  useEffect(() => {
    if (sessionData && sessionData.canShowReschedule) {
      plugin.meeting.setActiveTab(plugin.tabName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData]);

  function rescheduleInstructions() {
    const { noShowDetails } = sessionData;

    return (
      <div className="reschedule__instructions">
        <div>
          Looks like your
          {`${isMentee ? ' mentor ' : ' mentee '}`}
          hasn't yet joined the session,
          we suggest you do the following:
        </div>
        <ol className="reschedule__person-details">
          <li>
            Please contact
            <strong>{` ${noShowDetails.session_with} `}</strong>
            on email
            <strong>{` ${noShowDetails.session_with_email} `}</strong>
            or call on
            <strong>{` ${noShowDetails.session_with_number} `}</strong>
          </li>
          <li>
            or reschedule this session based on your convenience.
          </li>
        </ol>
      </div>
    );
  }

  if (bothJoined) {
    return (
      <div className="p-10 m-v-10">
        Session Rescheduling is disabled.
        Looks like your
        <strong>
          {isMentee ? ' mentor ' : ' mentee '}
        </strong>
        has joined the session. Rescheduling is only enabled if the other
        participant doesn't join.
      </div>
    );
  } else if (message && message.length > 0) {
    return (
      <div className="p-10 m-v-10">
        {message}
      </div>
    );
  } else if (isLoading) {
    return (<LoadingLayout />);
  } else if (loadError) {
    return (
      <HintLayout
        actionLabel="Try again"
        actionFn={() => plugin.load()}
        message="Failed to load"
      />
    );
  } else if (sessionData) {
    if (sessionData.canShowReschedule) {
      return (
        <div className="layout">
          <div className="layout__content reschedule">
            {rescheduleInstructions()}
            {isMentee
              ? <MenteeReschedule plugin={plugin} />
              : <MentorReschedule plugin={plugin} />}
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-10 m-v-10">
          {sessionData.rescheduleMessage}
        </div>
      );
    }
  } else return null;
}

export default mobxify('meetingStore', 'plugin')(ReschedulePage);
