import React from 'react';
import PropTypes from 'prop-types';

import {
  Dropdown, DropdownItem, Icon,
} from '@common/ui/general';
import ParticipantActions from '~meetings/ui/participants/actions';

function MeetingParticipantActions({
  className,
  areActionsOpen,
  setActionsOpen,
  fromId,
  messageBody,
  message,
}) {
  return (
    <Dropdown
      className={className}
      titleClassName={`btn btn-small btn-icon btn-dark ${className}__btn`}
      title={<Icon name="more-vert" />}
      label="More actions"
      isOpen={areActionsOpen}
      onChange={setActionsOpen}
      popoverProps={{
        className: 'm-actions-dropdown',
        extraScope: 'meeting-app',
        location: { top: '110%', right: 0 },
      }}
    >
      <DropdownItem
        component={ParticipantActions.ToggleMute}
        userId={fromId}
      />
      <DropdownItem
        component={ParticipantActions.ToggleChat}
        userId={fromId}
      />
      {!messageBody && (
        <DropdownItem
          component={ParticipantActions.BoostUpvotes}
          question={message}
          userId={fromId}
        />
      )}
      {messageBody && (
        <DropdownItem
          component={ParticipantActions.PinMessage}
          messageBody={messageBody}
        />
      )}
      <DropdownItem
        component={ParticipantActions.ToggleBan}
        userId={fromId}
      />
      {messageBody && (
        <DropdownItem
          component={ParticipantActions.DeleteMessage}
          message={message}
        />
      )}
    </Dropdown>
  );
}

MeetingParticipantActions.propTypes = {
  className: PropTypes.string,
  areActionsOpen: PropTypes.bool,
  setActionsOpen: PropTypes.func,
  fromId: PropTypes.string,
};

export default MeetingParticipantActions;
