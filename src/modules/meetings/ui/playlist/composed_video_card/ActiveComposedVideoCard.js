import React, { useEffect, useRef } from 'react';

import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import analytics from '~meetings/analytics';
import ComposedVideoDescription from './ComposedVideoDescription';
import ComposedVideoTitle from './ComposedVideoTitle';
import currentPlayIcon from '~meetings/images/current-play-icon.svg';
import PlaylistControls from '~meetings/ui/playlist/playlist_controls';

const ActiveComposedVideo = ({ content }) => {
  const ref = useRef(null);
  const timerRef = useRef();

  useEffect(() => {
    if (content?.hasComposedVideo) {
      analytics.view(CUE_CARD_TRACKING.cueCardView,
        'Assisted Live Class', {
          meeting_name: content?.playlist?.meeting?.name,
          hosts: content?.playlist?.meeting?.namesFromAllHosts,
          meeting_date_time: content?.playlist?.meeting?.startTime,
        });
    }
  }, [content]);

  useEffect(() => {
    if (ref) {
      timerRef.current = setTimeout(() => {
        ref.current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }, 1000);
    }

    return () => clearTimeout(timerRef.current);
  }, [ref]);

  return (
    <div className="m-assisted-live-card row">
      <div
        ref={ref}
        className="m-assisted-live-card__section"
      >
        <div className="m-topic-card__section p-15">
          <div className="row m-b-10 m-topic-card__header">
            <ComposedVideoTitle content={content} />
            <img
              src={currentPlayIcon}
              alt="icon"
            />
          </div>
          <ComposedVideoDescription content={content} />
        </div>
      </div>
      <PlaylistControls content={content} />
    </div>
  );
};

export default ActiveComposedVideo;
