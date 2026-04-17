import React from 'react';
import { observer } from 'mobx-react';

import { PLAYLIST_CONTENT_STATUS } from '~meetings/utils/playlist';
import ActiveProblemCard from './ActiveProblemCard';
import UpNextProblemCard from './UpNextProblemCard';
import SkippedProblemCard from './SkippedProblemCard';
import EndedProblemCard from './EndedProblemCard';
import FutureProblemCard from './FutureProblemCard';

function ProblemCard({ content }) {
  switch (content.status) {
    case PLAYLIST_CONTENT_STATUS.upcoming:
      return (<UpNextProblemCard content={content} />);
    case PLAYLIST_CONTENT_STATUS.active:
      return (<ActiveProblemCard content={content} />);
    case PLAYLIST_CONTENT_STATUS.skipped:
      return (<SkippedProblemCard content={content} />);
    case PLAYLIST_CONTENT_STATUS.completed:
      return (<EndedProblemCard content={content} />);
    case PLAYLIST_CONTENT_STATUS.future:
      return (<FutureProblemCard content={content} />);
    default:
      return null;
  }
}

export default observer(ProblemCard);
