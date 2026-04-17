import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import {
  PLAYLIST_CONTENT_TYPES,
  POLL_CARD_HEADING,
  PROBLEM_CARD_HEADING,
} from '~meetings/utils/playlist';
import skipIcon from '~meetings/images/skip-icon.svg';
import tickIcon from '~meetings/images/tick-icon.svg';

const ProblemCardTitle = ({ content }) => {
  const { status } = content;
  const showIcon = content.isSkipped || content.isCompleted;
  const title = (content.type === PLAYLIST_CONTENT_TYPES.problem
    ? PROBLEM_CARD_HEADING[status]
    : POLL_CARD_HEADING[status]) || '';

  return (
    <div className={classNames('row', 'm-topic-card__header-container')}>
      {showIcon && (
        <img
          className={classNames('m-r-5', 'm-topic-card__status-icon')}
          src={content.isSkipped ? skipIcon : tickIcon}
          alt="Skip Icon"
        />
      )}
      <div className={classNames(
        'h5 m-t-5 m-topic-card__future-text',
        { 'm-topic-card__quiz-current-text': content.isActive },
        { 'm-topic-card__done-text': content.isCompleted },
        { 'm-topic-card__skip-text': content.isSkipped },
      )}
      >
        {title}
      </div>
    </div>
  );
};

export default observer(ProblemCardTitle);
