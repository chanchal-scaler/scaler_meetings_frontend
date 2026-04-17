import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { CUE_CARD_HEADING } from '~meetings/utils/playlist';
import skipIcon from '~meetings/images/skip-icon.svg';
import tickIcon from '~meetings/images/tick-icon.svg';

const CueCardTitle = ({ content }) => {
  const { status } = content;
  const showIcon = content.isSkipped || content.isCompleted;
  const title = CUE_CARD_HEADING[status] || '';

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
        { 'm-topic-card__current-text': content.isActive },
        { 'm-topic-card__done-text': content.isCompleted },
        { 'm-topic-card__skip-text': content.isSkipped },
      )}
      >
        {title}
      </div>
    </div>
  );
};

export default observer(CueCardTitle);
