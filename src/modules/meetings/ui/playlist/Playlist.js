import React, { useEffect } from 'react';

import { mobxify } from '~meetings/ui/hoc';
import PlaylistScrollView from './PlaylistScrollView';

function Playlist({ meetingStore: store }) {
  const { meeting } = store;
  const { playlist } = meeting;

  useEffect(() => {
    if (playlist) playlist.loadContents();
  }, [playlist]);

  if (!playlist) {
    return null;
  } else if (playlist.contentList.length > 0) {
    return <PlaylistScrollView playlist={playlist} />;
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(Playlist);
