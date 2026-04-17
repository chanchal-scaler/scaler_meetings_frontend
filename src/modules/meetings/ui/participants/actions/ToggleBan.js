import React, { useCallback } from 'react';
import classNames from 'classnames';

import { dialog } from '@common/ui/general/Dialog';
import {
  Icon, Tappable, Tooltip,
} from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';

function ToggleBan({
  meetingStore, userId, iconButton, onClick,
}) {
  const { meeting } = meetingStore;

  const handleBanToggle = useCallback((event) => {
    const participant = meeting.getParticipant(userId);

    let content = 'Proceeding will ban the user and kick him out of meeting';
    if (participant.isBanned) {
      content = 'Proceeding will allow banned user to enter the meeting';
    }

    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content,
      onOk: () => meeting.manager.toggleBan(participant.userId),
    });

    if (onClick) {
      onClick(event);
    }
  }, [meeting, onClick, userId]);

  if (meeting && meeting.manager) {
    const participant = meeting.getParticipant(userId);

    if (meeting.isSuperHost && participant.roleLevel < 2) {
      if (iconButton) {
        return (
          <Tooltip
            className={classNames(
              'participant-action',
              { 'participant-action--danger': !participant.isBanned },
              { 'participant-action--primary': participant.isBanned },
            )}
            component={Tappable}
            onClick={handleBanToggle}
            title={participant.isBanned ? 'Remove ban' : 'Ban user'}
          >
            <Icon name="block" />
          </Tooltip>
        );
      } else {
        return (
          <Tappable
            className={classNames(
              'btn btn-small btn-inverted btn-sharp',
              { 'btn-danger': !participant.isBanned },
            )}
            onClick={handleBanToggle}
          >
            {participant.isBanned ? 'Remove ban' : 'Ban user'}
          </Tappable>
        );
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(ToggleBan);
