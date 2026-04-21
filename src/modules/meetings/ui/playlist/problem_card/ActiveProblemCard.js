import React, { useEffect, useRef } from 'react';

import ProblemCardTitle from './ProblemCardTitle';
import ProblemCardDescription from './ProblemCardDescription';
import { PLAYLIST_CONTENT_TYPES } from '~meetings/utils/playlist';

const ActiveProblemCard = ({ content }) => {
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

  const dynamicClass = content.type === PLAYLIST_CONTENT_TYPES.problem
    ? 'm-quiz-card__bg-img-quiz'
    : 'm-quiz-card__bg-img-poll';

  return (
    <>
      <div
        ref={ref}
        className={`m-topic-card ${dynamicClass} m-topic-card__current-quiz`}
      >
        <div className="m-topic-card__section p-15">
          <div className="row m-b-5 m-topic-card__header">
            <ProblemCardTitle
              content={content}
            />
          </div>
          <ProblemCardDescription
            content={content}
          />
        </div>
      </div>
    </>
  );
};

export default ActiveProblemCard;
