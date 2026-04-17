import React from 'react';
import { observer } from 'mobx-react';

import { PLAYLIST_CONTENT_STATUS } from '~meetings/utils/playlist';
import UpNextComposedVideoCard from './UpNextComposedVideoCard';
import ActiveComposedVideoCard from './ActiveComposedVideoCard';
import EndedComposedVideoCard from './EndedComposedVideoCard';
import FutureComposedVideoCard from './FutureComposedVideoCard';
import SkippedComposedVideoCard from './SkippedComposedVideoCard';

function ComposedVideoCard({ content }) {
  switch (content.status) {
    case PLAYLIST_CONTENT_STATUS.active:
      return <ActiveComposedVideoCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.upcoming:
      return <UpNextComposedVideoCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.completed:
      return <EndedComposedVideoCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.future:
      return <FutureComposedVideoCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.skipped:
      return <SkippedComposedVideoCard content={content} />;
    default:
      return null;
  }
}

export default observer(ComposedVideoCard);
