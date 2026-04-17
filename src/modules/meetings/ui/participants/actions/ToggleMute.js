import React, { useCallback } from 'react';

import {
  Icon, Tappable, Tooltip,
} from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';

function ToggleMute({
  meetingStore, userId, iconButton, onClick,
}) {
  const { meeting } = meetingStore;

  const handleMute = useCallback((event) => {
    const { manager } = meeting;
    manager.muteAudience(userId);

    if (onClick) {
      onClick(event);
    }
  }, [meeting, onClick, userId]);

  const handleUnmute = useCallback((event) => {
    const { manager } = meeting;
    manager.unmuteAudience(userId);

    if (onClick) {
      onClick(event);
    }
  }, [meeting, onClick, userId]);

  if (meeting && meeting.manager && meeting.isSuperHost) {
    const participant = meeting.getParticipant(userId);

    if (
      participant.roleLevel < 1
      && !participant.isBanned
    ) {
      if (participant.isUnmuted) {
        if (iconButton) {
          return (
            <Tooltip
              className="
                participant-action
                participant-action--main
                participant-action--primary
              "
              component={Tappable}
              onClick={handleMute}
              title="Click to mute"
            >
              <Icon name="mic" />
            </Tooltip>
          );
        } else {
          return (
            <Tappable
              className="btn btn-small btn-inverted btn-sharp"
              onClick={handleMute}
            >
              Mute user
            </Tappable>
          );
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (iconButton) {
          return (
            <Tooltip
              className="
                participant-action
                participant-action--danger
              "
              component={Tappable}
              onClick={handleUnmute}
              title="Click to unmute"
            >
              <Icon name="mic-off" />
            </Tooltip>
          );
        } else {
          return (
            <Tappable
              className="btn btn-small btn-inverted btn-sharp"
              onClick={handleUnmute}
            >
              Unmute user
            </Tappable>
          );
        }
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(ToggleMute);
