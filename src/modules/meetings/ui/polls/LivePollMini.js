import React from 'react';

import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { TimeElapsed } from '~meetings/ui/general';
import PollChoices from './PollChoices';
import PollDescription from './PollDescription';
import PollResponses from './PollResponses';

function LivePollMini({ meetingStore: store, handleEnd }) {
  const { meeting } = store;
  const { manager } = meeting;
  const { poll } = manager;

  function hostActionUi() {
    if (poll.resultPublishError) {
      return (
        <div className="text-c h5">
          <span className="hint m-r-5">Failed to publish result.</span>
          {/* eslint-disable-next-line */}
          <a
            className="link"
            onClick={() => poll.publishResult()}
          >
            Try again
          </a>
        </div>
      );
    } else if (!poll.isEndedOnServer) {
      return (
        <div className="text-c h5">
          {/* eslint-disable-next-line */}
          <a
            className="link"
            onClick={handleEnd}
          >
            End poll now
          </a>
        </div>
      );
    } else {
      return null;
    }
  }

  function superHostUi() {
    return (
      <div className="m-poll-mini__main-inner">
        <div className="m-poll-mini__content">
          <PollDescription
            className="m-b-5"
            description={poll.description}
          />
          <PollResponses
            choices={poll.choices}
            distribution={poll.distribution}
            participationCount={poll.participationCount}
            totalResponses={poll.totalResponses}
          />
          {hostActionUi()}
        </div>
      </div>
    );
  }

  function audienceUi() {
    return (
      <div className="m-poll-mini__main-inner">
        <div className="m-poll-mini__content">
          <PollDescription
            className="m-b-5"
            description={poll.description}
          />
          {poll.canSelectMultiple && (
            <div className="h5 hint text-c">Select one or more options</div>
          )}
          <PollChoices
            choices={poll.choices}
            onSelect={poll.setMyChoice}
            selectedIndices={poll.myChoiceIndices}
          />
          <Tappable
            className="btn btn-primary btn-small full-width m-v-5"
            disabled={!poll.canSubmit}
            onClick={() => poll.submit()}
          >
            Submit
          </Tappable>
        </div>
        {poll.isSubmitted && (
          <div className="m-poll-mini__submission">
            <Icon className="h3 m-b-5 success" name="tick" />
            <div className="bold dark">
              Sucessfully submitted!
            </div>
          </div>
        )}
      </div>
    );
  }

  function mainUi() {
    if (meeting.isSuperHost) {
      return superHostUi();
    } else {
      return audienceUi();
    }
  }

  return (
    <div className="m-poll-mini">
      <TimeElapsed
        duration={poll.duration}
        timeElapsed={poll.timeElapsed}
      />
      <h5 className="bold hint m-t-5">Poll time!</h5>
      {mainUi()}
    </div>
  );
}

export default mobxify('meetingStore')(LivePollMini);
