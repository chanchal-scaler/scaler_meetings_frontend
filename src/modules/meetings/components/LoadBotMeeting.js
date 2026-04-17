import { useEffect } from 'react';

import { LayoutModes } from '~meetings/utils/layout';
import { mobxify } from '~meetings/ui/hoc';
import { SocketStatus } from '~meetings/utils/meeting';

function LoadBotMeeting({
  children,
  meetingStore: store,
  layoutStore,
  slug,
}) {
  const { data, meeting } = store;

  useEffect(() => {
    store.load(slug);
    return () => store.unload();
  }, [store, slug]);

  useEffect(() => {
    if (data) { store.loadMeeting(slug); }
  }, [data, slug, store]);

  useEffect(() => {
    if (meeting && !meeting.isLoggedIn) {
      meeting.setSelectedRole('audience');
      meeting.markLoggedIn();
      layoutStore.setMode(LayoutModes.recording);
    }

    return () => meeting?.destroy();
  }, [layoutStore, meeting]);

  if (
    meeting
    && meeting.isLoggedIn
    && meeting.manager.status === SocketStatus.connected
  ) {
    return children;
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'layoutStore')(LoadBotMeeting);
