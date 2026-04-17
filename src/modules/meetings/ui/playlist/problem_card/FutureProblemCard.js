import React, { useState, useRef } from 'react';
import classNames from 'classnames';

import ProblemCardTitle from './ProblemCardTitle';
import ProblemCardDescription from './ProblemCardDescription';
import ProblemQuickViewPopover from '../ProblemQuickViewPopover';
import ViewProblemCardButton from './ViewProblemCardButton';
import { PLAYLIST_CONTENT_TYPES } from '~meetings/utils/playlist';

const FutureProblemCard = ({ content }) => {
  const [isHovering, setIsHovering] = useState(false);
  const ref = useRef(null);

  const hideActionButton = !isHovering;

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);
  };

  const dynamicClass = content.type === PLAYLIST_CONTENT_TYPES.problem
    ? 'm-quiz-card__bg-img-quiz'
    : 'm-quiz-card__bg-img-poll';

  return (
    <>
      <div
        ref={ref}
        className={`m-topic-card ${dynamicClass}`}
        onMouseEnter={handleMouseOver}
        onFocus={handleMouseOver}
        onMouseLeave={handleMouseOut}
        onBlur={handleMouseOut}
      >
        <div className={classNames(
          'm-topic-card__action',
          { 'm-topic-card__hide': hideActionButton },
        )}
        >
          <ViewProblemCardButton
            content={content}
          />
        </div>
        <div className={classNames(
          'm-topic-card__section p-15',
          { 'm-topic-card__hide': !hideActionButton },
        )}
        >
          <div className="row m-b-5 m-topic-card__header">
            <ProblemCardTitle
              content={content}
            />
          </div>
          <ProblemCardDescription
            content={content}
          />
        </div>
        <div className="m-topic-card__strip-container">
          <div className="m-topic-card__side-strip" />
        </div>
      </div>
      <ProblemQuickViewPopover
        content={content}
        parentRef={ref}
      />
    </>
  );
};

export default FutureProblemCard;
