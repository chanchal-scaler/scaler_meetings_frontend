import React from 'react';
import { observer } from 'mobx-react';

import { PLAYLIST_CONTENT_STATUS } from '~meetings/utils/playlist';
import ActiveHtmlCard from './html_card/ActiveHtmlCard';
import EndedHtmlCard from './html_card/EndedHtmlCard';
import FutureCueCard from './FutureCueCard';
import SkippedHtmlCard from './html_card/SkippedHtmlCard';
import UpNextCueCard from './UpNextCueCard';

function HtmlCard({ content }) {
  switch (content.status) {
    case PLAYLIST_CONTENT_STATUS.upcoming:
      return <UpNextCueCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.active:
      return <ActiveHtmlCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.skipped:
      return <SkippedHtmlCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.completed:
      return <EndedHtmlCard content={content} />;
    case PLAYLIST_CONTENT_STATUS.future:
      return <FutureCueCard content={content} />;
    default:
      return null;
  }
}

export default observer(HtmlCard);
