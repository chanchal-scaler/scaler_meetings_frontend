import React, { useCallback } from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { Tappable } from '@common/ui/general';

function AcknowledgementAction({
  meetingStore,
  label,
  chatMessageId,
}) {
  const { meeting: { nudge, manager } } = meetingStore;

  const handleClick = useCallback(() => {
    nudge.removeCurrentNudge();

    if (chatMessageId) {
      manager.sendNudgeAcknowledgement(chatMessageId);
    }
  }, [nudge, chatMessageId, manager]);


  return (
    <Tappable
      className="btn btn-primary btn-inverted m-btn"
      onClick={handleClick}
    >
      {label}
    </Tappable>
  );
}

export default mobxify('meetingStore')(AcknowledgementAction);
