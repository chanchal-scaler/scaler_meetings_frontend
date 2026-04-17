import React, { useCallback } from 'react';
import classNames from 'classnames';

import {
  Icon, Tappable, Tooltip,
} from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';

// todo: verify trackings
function ToggleChat({
  meetingStore, userId, iconButton, onClick,
}) {
  const { meeting } = meetingStore;

  const handleEnable = useCallback((event) => {
    const { manager } = meeting;
    manager.enableChat(userId);
    if (onClick) {
      onClick(event);
    }
  }, [meeting, onClick, userId]);

  const handleDisable = useCallback((event) => {
    const { manager } = meeting;
    manager.disableChat(userId);
    if (onClick) {
      onClick(event);
    }
  }, [meeting, onClick, userId]);

  if (meeting && meeting.manager && meeting.isSuperHost) {
    const participant = meeting.getParticipant(userId);

    if (participant.roleLevel < 1 && !participant.isBanned) {
      if (participant.isChatDisabled) {
        if (iconButton) {
          return (
            <Tooltip
              className={classNames(
                'participant-action',
                'participant-action--primary',
              )}
              component={Tappable}
              onClick={handleEnable}
              title="Enable chat"
            >
              <Icon name="chat" />
            </Tooltip>
          );
        } else {
          return (
            <Tappable
              className="btn btn-small btn-inverted btn-sharp"
              onClick={handleEnable}
            >
              Enable Chat & Questions
            </Tappable>
          );
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (iconButton) {
          return (
            <Tooltip
              className={classNames(
                'participant-action',
                'participant-action--danger',
              )}
              component={Tappable}
              onClick={handleDisable}
              title="Disable chat"
            >
              <Icon name="chat" />
            </Tooltip>
          );
        } else {
          return (
            <Tappable
              className="btn btn-small btn-inverted btn-sharp"
              onClick={handleDisable}
            >
              Disable Chat & Questions
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

export default mobxify('meetingStore')(ToggleChat);
