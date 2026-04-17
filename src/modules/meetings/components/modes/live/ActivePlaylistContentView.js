import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { PLAYLIST_CONTENT_TYPES } from '~meetings/utils/playlist';
import ActiveCueCardView from '~meetings/ui/playlist/ActiveCueCardView';

const ActivePlaylistContentView = ({ meetingStore: store }) => {
  const { meeting } = store;
  const { playlist } = meeting;
  const canControlPlaylist = meeting?.canControlPlaylist;


  if (playlist?.activeContent
    && ((canControlPlaylist
    || playlist?.activeContent?.type === PLAYLIST_CONTENT_TYPES.instructorCard)
    || playlist?.activeContent?.type === PLAYLIST_CONTENT_TYPES.alumniCard
    || playlist?.activeContent?.type === PLAYLIST_CONTENT_TYPES.htmlCard)) {
    switch (playlist.activeContent.type) {
      case PLAYLIST_CONTENT_TYPES.cueCard:
        return playlist?.isVisible
          ? <ActiveCueCardView content={playlist.activeContent} />
          : null;
      case PLAYLIST_CONTENT_TYPES.instructorCard:
      case PLAYLIST_CONTENT_TYPES.alumniCard:
      case PLAYLIST_CONTENT_TYPES.htmlCard:
        return <ActiveCueCardView content={playlist.activeContent} />;
      default:
        return null;
    }
  } else {
    return null;
  }
};

export default mobxify('meetingStore')(ActivePlaylistContentView);
