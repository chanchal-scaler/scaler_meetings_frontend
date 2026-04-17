import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

import CueCardTitle from '~meetings/ui/playlist/cue_card/CueCardTitle';
import CueCardDescription
  from '~meetings/ui/playlist/cue_card/CueCardDescription';
import StopCueCardButton from '../StopCueCardButton';
import topicIcon from '~meetings/images/topic-icon.svg';

const ActiveInstructorAlumniCard = ({ content }) => {
  const canControlPlaylist = content?.playlist?.meeting?.canControlPlaylist;
  const ref = useRef(null);
  const timerRef = useRef();

  useEffect(() => {
    if (ref.current) {
      timerRef.current = setTimeout(() => {
        ref.current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }, 1000);
    }

    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      ref={ref}
      className={classNames(
        'm-topic-card relative row',
        'm-topic-card__current-topic',
        'm-topic-card--instructor-card',
        { 'm-topic-card--audience-card': !canControlPlaylist },
      )}
    >
      <div className="m-topic-card__section p-15">
        <div className="row m-b-10 m-topic-card__header">
          <CueCardTitle content={content} />
          <img
            src={topicIcon}
            alt="icon"
          />
        </div>
        <CueCardDescription content={content} />
      </div>
      {canControlPlaylist && (
        <div className="p-20 m-topic-card__action">
          <StopCueCardButton content={content} />
        </div>
      )}
    </div>
  );
};

export default ActiveInstructorAlumniCard;
