import { useEffect } from 'react';

import { mobxify } from '~meetings/ui/hoc';

function InitializeBotMeeting({ children, meetingStore: store }) {
  const { meeting } = store;

  useEffect(() => {
    meeting.initialise();
  }, [meeting]);

  if (
    meeting
    && meeting.isJoined
    && meeting.videoBroadcasting.isLoaded
  ) {
    return children;
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'layoutStore')(InitializeBotMeeting);
