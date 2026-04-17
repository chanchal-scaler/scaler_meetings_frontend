import React, { useEffect } from 'react';
import { observer } from 'mobx-react';

import PlaylistScrollViewContent from './PlaylistScrollViewContent';

function PlaylistScrollView({ playlist }) {
  useEffect(() => {
    playlist.loadSessions();
  }, [playlist]);

  if (playlist.isVisible || !playlist.isToggleEnabled) {
    return <PlaylistScrollViewContent playlist={playlist} />;
  } else {
    return null;
  }
}

export default observer(PlaylistScrollView);
