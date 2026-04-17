import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

const CueCardDescription = ({ content }) => {
  const canControlPlaylist = content?.playlist?.meeting?.canControlPlaylist;
  return (
    <>
      <div className={classNames(
        'h5 m-topic-card__desc-text',
        { 'm-topic-card__current-text': content.isActive },
        { 'm-topic-card__done-text': content.isCompleted },
        { 'm-topic-card__future-text': content.isFuture },
      )}
      >
        {content.name}
      </div>
      <div className={classNames(
        'h5 m-topic-card__index',
        { 'm-topic-card__current-text': content.isActive },
        { 'm-topic-card__done-text': content.isCompleted },
        { 'm-topic-card__future-text': content.isFuture },
      )}
      >
        {canControlPlaylist ? content.order : null}
      </div>
    </>
  );
};

export default observer(CueCardDescription);
