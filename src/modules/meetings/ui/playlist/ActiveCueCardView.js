import React, { useEffect, useState, useCallback } from 'react';

import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import { useComponentViewedTracking } from '@common/hooks';
import analytics from '~meetings/analytics';
import CueCardContent from './cue_card/CueCardContent';
import LoadPlaylistContent from './LoadPlaylistContent';

const ActiveCueCardView = ({ content }) => {
  const [titlePageVisible, setTitlePageVisible] = useState(true);

  const ref = useComponentViewedTracking({
    analytics,
    eventName: CUE_CARD_TRACKING.cueCardView,
    source: 'Live Meeting',
    payload: {
      cue_card_name: content?.name,
      cue_card_order: content?.order,
      meeting_name: content?.playlist?.meeting?.name,
      hosts: content?.playlist?.meeting?.namesFromAllHosts,
      meeting_date_time: content?.playlist?.meeting?.startTime,
    },
  });

  const isHost = content?.playlist?.meeting?.isHost;

  useEffect(() => setTitlePageVisible(true), []);

  const onAnimationEnd = useCallback(() => {
    setTitlePageVisible(false);
  }, []);

  return (
    <LoadPlaylistContent content={content} className="m-10 main-content-view">
      {() => (
        <div className="m-10 main-content-view" ref={ref}>
          {!(!isHost && (
            content.isInstructorAlumniCard
            || content.isHtmlCard
          )) && (
            <div className="row main-content-view__header">
              <div className="main-content-view__text">{content.name}</div>
            </div>
          )}
          <div className="p-20 main-content-view__content scroll">
            {
              titlePageVisible
              && !content.isInstructorAlumniCard
              && !content.isHtmlCard
                ? (
                  <div
                    onAnimationEnd={onAnimationEnd}
                    className="main-content-view__title-page"
                  >
                    <span className="main-content-view__page-header">
                      {content.name}
                    </span>
                    <span className="main-content-view__page-topic">
                      Topic
                      {' '}
                      {content.order}
                    </span>
                  </div>
                )
                : <CueCardContent content={content} />
            }
          </div>
        </div>
      )}
    </LoadPlaylistContent>
  );
};

export default ActiveCueCardView;
