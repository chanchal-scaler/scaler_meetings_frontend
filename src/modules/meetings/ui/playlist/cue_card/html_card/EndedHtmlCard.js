import React, { useState, useRef } from 'react';
import classNames from 'classnames';

import ContentDescription
  from '~meetings/ui/playlist/cue_card/CueCardDescription';
import ContentTitle from '~meetings/ui/playlist/cue_card/CueCardTitle';
import CueCardQuickViewPopover from '../../CueCardQuickViewPopover';
import ReplayCueCardButton from '../ReplayCueCardButton';
import topicIcon from '~meetings/images/topic-icon.svg';
import ViewCueCardButton from '../ViewCueCardButton';

const EndedCueCard = ({ content }) => {
  const canControlPlaylist = content?.playlist?.meeting?.canControlPlaylist;
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
          {canControlPlaylist && <ReplayCueCardButton content={content} />}
          <ViewCueCardButton content={content} />
        </div>
        <div className={classNames(
          'm-topic-card__section p-15',
          { 'm-topic-card__hide': !!isHovering },
        )}
        >
          <div className="row m-b-10 m-topic-card__header">
            <ContentTitle content={content} />
            <img
              src={topicIcon}
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
      <CueCardQuickViewPopover
        content={content}
        parentRef={ref}
      />
    </>
  );
};

export default EndedCueCard;
