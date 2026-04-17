import React, { useCallback, useEffect } from 'react';

import { mobxify } from '~meetings/ui/hoc';
import Nudge from './Nudge';

function MainContainer({ children, meetingStore: store }) {
  const { meeting } = store;

  useEffect(() => {
    // Show once at the start so that users are aware that controls are
    // available
    meeting.setControlsVisible(true);

    return () => meeting.setFullscreen(false);
  }, [meeting]);

  const handleMouseMove = useCallback(() => {
    meeting.setControlsVisible(true);
  }, [meeting]);

  return (
    <div
      className="meeting-main"
      onMouseMove={handleMouseMove}
    >
      {children}
      <Nudge />
    </div>
  );
}

export default mobxify('meetingStore')(MainContainer);
