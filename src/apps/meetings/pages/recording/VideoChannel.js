import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { useFetchPlaylistSession } from '~meetings/hooks';
import { VideoParticipants } from '~meetings/ui/meeting';

function VideoChannel({ meetingStore: store }) {
  const { meeting } = store;

  useFetchPlaylistSession(meeting);

  return <VideoParticipants />;
}

export default mobxify('meetingStore')(VideoChannel);
