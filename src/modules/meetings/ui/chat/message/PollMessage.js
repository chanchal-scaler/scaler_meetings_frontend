import React from 'react';

import { PollDescription, PollResponses } from '~meetings/ui/polls';

function PollMessage({ message }) {
  return (
    <div className="message-poll">
      <h5 className="bold hint m-t-5">Poll results!</h5>
      <PollDescription
        className="m-b-5"
        description={message.description}
      />
      <PollResponses
        choices={message.choices}
        distribution={message.distribution}
        participationCount={message.participationCount}
        totalResponses={message.totalResponses}
      />
    </div>
  );
}
export default PollMessage;
