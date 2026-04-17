import React from 'react';
import { observer } from 'mobx-react';

import { PLAYLIST_CONTENT_STATUS } from '~meetings/utils/playlist';
import ActiveDoubtCard from './ActiveDoubtCard';
import FutureDoubtCard from './FutureDoubtCard';

function DoubtCard({ content }) {
  switch (content.status) {
    case PLAYLIST_CONTENT_STATUS.upcoming:
    case PLAYLIST_CONTENT_STATUS.future:
      return <FutureDoubtCard content={content} />;
    default:
      return <ActiveDoubtCard />;
  }
}

export default observer(DoubtCard);
