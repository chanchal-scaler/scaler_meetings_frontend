import React from 'react';
import { observer } from 'mobx-react';

import { PLAYLIST_CONTENT_STATUS } from '~meetings/utils/playlist';
import ActiveCueCard from './ActiveCueCard';
import UpNextCueCard from './UpNextCueCard';
import EndedCueCard from './EndedCueCard';
import FutureCueCard from './FutureCueCard';
import SkippedCueCard from './SkippedCueCardCard';

function CueCard({ content }) {
  switch (content.status) {
    case PLAYLIST_CONTENT_STATUS.upcoming:
      return <UpNextCueCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.active:
      return <ActiveCueCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.skipped:
      return <SkippedCueCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.completed:
      return <EndedCueCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.future:
      return <FutureCueCard content={content} />;
    default:
      return null;
  }
}

export default observer(CueCard);
