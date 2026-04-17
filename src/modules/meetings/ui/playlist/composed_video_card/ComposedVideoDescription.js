import React from 'react';
import classNames from 'classnames';

const ComposedVideoDescription = ({ content }) => (
  <>
    <div className={classNames(
      'h5 m-topic-card__desc-text',
      { 'm-topic-card__current-text': content.isActive },
      { 'm-topic-card__done-text': content.isCompleted },
      { 'm-topic-card__future-text': content.isFuture || content.isUpcoming },
    )}
    >
      {content.name}
    </div>
    <div className={classNames(
      'h5 m-topic-card__index',
      { 'm-topic-card__current-text': content.isActive },
      { 'm-topic-card__done-text': content.isCompleted },
      { 'm-topic-card__future-text': content.isFuture || content.isUpcoming },
    )}
    >
      {content.order}
    </div>
  </>
);

export default ComposedVideoDescription;
