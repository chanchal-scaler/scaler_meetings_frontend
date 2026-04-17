import React, { useCallback, useEffect } from 'react';

import { BroadcastSetupModes } from '~meetings/utils/role';
import { mobxify } from '~meetings/ui/hoc';
import { Modal } from '@common/ui/general';
import { UnmuteAccessLevel } from '~meetings/utils/meeting';
import AudioVideoPromptBody from './AudioVideoPromptBody';
import UnmutePromptBody from './UnmutePromptBody';

function BroadcastSetupModal({ meetingStore: store }) {
  const { meeting } = store;
  const { manager } = meeting;
  const isOpen = Boolean(meeting.broadcastSetupMode);

  useEffect(() => () => {
    meeting.setBroadcastSetupMode(null);
  }, [meeting]);

  const handleClose = useCallback(() => {
    meeting.setBroadcastSetupMode(null);
  }, [meeting]);

  function titleUi() {
    switch (meeting.broadcastSetupMode) {
      case BroadcastSetupModes.host:
        return 'Join as host';
      case BroadcastSetupModes.audience:
        return 'Unmuted by host';
      default:
        return '';
    }
  }

  function ui() {
    if (isOpen) {
      if (
        meeting.broadcastSetupMode === BroadcastSetupModes.host
        || manager.settings.unmute_access !== UnmuteAccessLevel.audio
      ) {
        return <AudioVideoPromptBody />;
      } else {
        return <UnmutePromptBody />;
      }
    } else {
      return null;
    }
  }

  return (
    <Modal
      className="m-modal"
      isOpen={isOpen}
      onClose={handleClose}
      title={titleUi()}
    >
      {ui()}
    </Modal>
  );
}


export default mobxify('meetingStore')(BroadcastSetupModal);
