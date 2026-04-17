import React from 'react';
import { observer } from 'mobx-react';

import { Avatar, Icon } from '@common/ui/general';
import ParticipantActions from './actions';

function ParticipantItem({ participant }) {
  const labels = [];
  if (participant.isHost) {
    labels.push('Host');
  }

  if (participant.isCurrentUser) {
    labels.push('You');
  }

  function statusUi() {
    if (participant.isHandRaised) {
      return (
        <div className="participant-item__status">
          <Icon name="hand" />
          <span className="m-l-5">
            Raised hand
          </span>
        </div>
      );
    } else {
      return null;
    }
  }

  function actionsUi() {
    return (
      <div className="participant-item__actions">
        <ParticipantActions.ToggleBan userId={participant.userId} iconButton />
        <ParticipantActions.ToggleChat userId={participant.userId} iconButton />
        <ParticipantActions.ToggleMute userId={participant.userId} iconButton />
      </div>
    );
  }

  return (
    <div className="participant-item">
      <Avatar
        className="participant-item__avatar"
        image={participant.avatar}
        title={participant.name}
      />
      <div className="participant-item__name">
        {participant.name}
        {' '}
        {labels.length > 0 && `(${labels.join(', ')})`}
      </div>
      {statusUi()}
      {actionsUi()}
    </div>
  );
}

export default observer(ParticipantItem);
