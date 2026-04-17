import React, { useState, useRef } from 'react';
import classNames from 'classnames';

import ComposedVideoDescription from './ComposedVideoDescription';
import ComposedVideoTitle from './ComposedVideoTitle';
import playIcon from '~meetings/images/play-icon.svg';
import StartComposedVideoButton from './StartComposedVideoButton';
import VideoQuickView from '../VideoQuickView';
import ViewComposedVideoButton from './ViewComposedVideoButton';

const SkippedComposedVideoCard = ({ content }) => {
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
          <StartComposedVideoButton className="m-b-10" content={content} />
          <ViewComposedVideoButton content={content} />
        </div>
        <div className={classNames(
          'm-topic-card__section p-15',
          { 'm-topic-card__hide': isHovering },
        )}
        >
          <div className="row m-b-10 m-topic-card__header">
            <ComposedVideoTitle content={content} />
            <img
              src={playIcon}
              alt="icon"
            />
          </div>
          <ComposedVideoDescription content={content} />
        </div>
        <div className="m-topic-card__strip-container">
          <div
            className={
              classNames(
                'm-topic-card__side-strip',
                'm-topic-card__side-strip--skipped',
              )
            }
          />
        </div>
      </div>
      <VideoQuickView content={content} />
    </>
  );
};

export default SkippedComposedVideoCard;
