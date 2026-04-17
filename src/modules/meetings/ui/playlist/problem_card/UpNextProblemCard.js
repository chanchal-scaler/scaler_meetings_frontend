import React, { useRef } from 'react';
import classNames from 'classnames';

import ProblemCardDescription from './ProblemCardDescription';
import ProblemCardTitle from './ProblemCardTitle';
import ProblemQuickViewPopover from '../ProblemQuickViewPopover';
import ViewProblemCardButton from './ViewProblemCardButton';
import { PLAYLIST_CONTENT_TYPES } from '~meetings/utils/playlist';

const UpNextProblemCard = ({ content }) => {
  const ref = useRef();

  const dynamicClass = content.type === PLAYLIST_CONTENT_TYPES.problem
    ? 'm-quiz-card__bg-img-quiz'
    : 'm-quiz-card__bg-img-poll';

  return (
    <>
      <div
        ref={ref}
        className="m-up-next-card relative row"
      >
        <div
          className={classNames(
            `m-topic-card__section p-15 ${dynamicClass}`,
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
        <div className="m-topic-card__action">
          <ViewProblemCardButton
            content={content}
          />
        </div>
      </div>
      <ProblemQuickViewPopover
        content={content}
        parentRef={ref}
      />
    </>
  );
};

export default UpNextProblemCard;
