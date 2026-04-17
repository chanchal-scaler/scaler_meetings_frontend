import React, { memo } from 'react';

import { PLAYLIST_CONTENT_TYPES } from '~meetings/utils/playlist';
import ComposedVideoCard from './composed_video_card/ComposedVideoCard';
import CueCard from './cue_card/CueCard';
import DoubtCard from './doubt_card/DoubtCard';
import HtmlCard from './cue_card/HtmlCard';
import InactiveDoubtCard from './doubt_card/InactiveDoubtCard';
import ProblemCard from './problem_card/ProblemCard';

function ContentCard({ content }) {
  switch (content.type) {
    case PLAYLIST_CONTENT_TYPES.cueCard:
      if (content.isDoubtCard) {
        return <DoubtCard content={content} />;
      } else {
        return (
          <CueCard content={content} />
        );
      }
    case PLAYLIST_CONTENT_TYPES.instructorCard:
    case PLAYLIST_CONTENT_TYPES.alumniCard:
    case PLAYLIST_CONTENT_TYPES.htmlCard:
      return <HtmlCard content={content} />;
    case PLAYLIST_CONTENT_TYPES.problem:
    case PLAYLIST_CONTENT_TYPES.poll:
      return <ProblemCard content={content} />;
    case PLAYLIST_CONTENT_TYPES.composedVideo:
      return (
        <>
          <ComposedVideoCard content={content} />
          <InactiveDoubtCard />
        </>
      );
    default:
      return null;
  }
}

export default memo(ContentCard);
