import React, { useState, useRef } from 'react';
import classNames from 'classnames';

import ComposedVideoCardTitle from './ComposedVideoTitle';
import ComposedVideoDescription from './ComposedVideoDescription';
import playIcon from '~meetings/images/play-icon.svg';
import StartComposedVideoButton from './StartComposedVideoButton';
import ViewCueCardButton from './ViewComposedVideoButton';
import VideoQuickView from '~meetings/ui/playlist/VideoQuickView';

const FutureComposedVideoCard = ({ content }) => {
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
          <div className="p-20">
            <StartComposedVideoButton className="m-b-10" content={content} />
            <ViewCueCardButton content={content} />
          </div>
        </div>
        <div className={classNames(
          'm-topic-card__section p-15',
          { 'm-topic-card__hide': isHovering },
        )}
        >
          <div className="row m-b-10 m-topic-card__header">
            <ComposedVideoCardTitle content={content} />
            <img
              src={playIcon}
              alt="icon"
            />
          </div>
          <ComposedVideoDescription content={content} />
        </div>
      </div>
      <VideoQuickView content={content} />
    </>
  );
};

export default FutureComposedVideoCard;
