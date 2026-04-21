import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

import CueCardTitle from '~meetings/ui/playlist/cue_card/CueCardTitle';
import CueCardDescription
  from '~meetings/ui/playlist/cue_card/CueCardDescription';
import topicIcon from '~meetings/images/topic-icon.svg';

const ActiveCueCard = ({ content }) => {
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (ref) {
      timerRef.current = setTimeout(() => {
        ref.current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }, 1000);
    }

    return () => clearTimeout(timerRef.current);
  }, [ref]);

  return (
    <div
      ref={ref}
      className={classNames(
        'm-topic-card',
        'm-topic-card__current-topic',
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
    </div>
  );
};

export default ActiveCueCard;
