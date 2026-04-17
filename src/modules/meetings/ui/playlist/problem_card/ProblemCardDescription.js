import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

const ProblemCardDescription = ({ content }) => (
  <>
    <div className={classNames(
      'h5 m-topic-card__desc-text',
      { 'm-topic-card__quiz-current-text': content.isActive },
      { 'm-topic-card__done-text': content.isCompleted },
      { 'm-topic-card__future-text': content.isFuture },
    )}
    >
      {content.name}
    </div>
    <div className={classNames(
      'h5 m-topic-card__index',
      { 'm-topic-card__quiz-current-text': content.isActive },
      { 'm-topic-card__done-text': content.isCompleted },
      { 'm-topic-card__future-text': content.isFuture },
    )}
    >
      {content.order}
    </div>
  </>
);

export default observer(ProblemCardDescription);
