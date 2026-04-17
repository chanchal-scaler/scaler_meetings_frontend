import React, { useCallback } from 'react';

import EndCall from '~meetings/ui/actions/EndCall';
import { mobxify } from '~meetings/ui/hoc';

function EndCallAction({ meetingStore, label }) {
  const { meeting: { nudge } } = meetingStore;

  const handleClick = useCallback(() => {
    nudge.removeCurrentNudge();
  }, [nudge]);

  return (
    <EndCall onClick={handleClick}>
      {label && <span className="m-nudge__action-button-text">{label}</span>}
    </EndCall>
  );
}

export default mobxify('meetingStore')(EndCallAction);
