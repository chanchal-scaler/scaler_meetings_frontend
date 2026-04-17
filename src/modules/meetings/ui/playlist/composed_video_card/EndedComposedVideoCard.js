import React, { useState, useRef } from 'react';
import classNames from 'classnames';

import ContentTitle from '~meetings/ui/playlist/cue_card/CueCardTitle';
import ContentDescription
  from '~meetings/ui/playlist/cue_card/CueCardDescription';
import playIcon from '~meetings/images/play-icon.svg';
import VideoQuickView from '../VideoQuickView';
import ViewCueCardButton from './ViewComposedVideoButton';
import ReplayComposedVideoButton from './ReplayComposedVideoButton';

const EndedComposedVideoCard = ({ content }) => {
  const [isHovering, setIsHovering] = useState(false);
  const ref = useRef(null);

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
  };

  return (
    <>
      <div
        ref={ref}
        className="m-topic-card"
        onMouseEnter={handleMouseOver}
        onFocus={handleMouseOver}
        onMouseLeave={handleMouseOut}
        onBlur={handleMouseOut}
      >
        <div className={classNames(
          'm-topic-card__action',
          { 'm-topic-card__hide': !isHovering },
        )}
        >
          <ViewCueCardButton content={content} />
          <ReplayComposedVideoButton content={content} />
        </div>
        <div className={classNames(
          'm-topic-card__section p-15',
          { 'm-topic-card__hide': isHovering },
        )}
        >
          <div className="row m-b-10 m-topic-card__header">
            <ContentTitle content={content} />
            <img
              src={playIcon}
              alt="icon"
            />
          </div>
          <ContentDescription content={content} />
        </div>
        <div className="m-topic-card__strip-container">
          <div
            className={
              classNames(
                'm-topic-card__side-strip',
                'm-topic-card__side-strip--done',
              )
            }
          />
        </div>
      </div>
      <VideoQuickView content={content} />
    </>
  );
};

export default EndedComposedVideoCard;
