import React from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import eyeIcon from '~meetings/images/eye.svg';
import whiteEyeIcon from '~meetings/images/white-eye.svg';
import { Tappable } from '@common/ui/general';

const ViewComposedVideoButton = ({ content }) => {
  const handleClick = () => {
    content.setQuickViewOpen(true);
  };

  return (
    <Tappable
      className={classNames(
        'row m-up-next-card__quick-view',
        { 'm-up-next-card__quick-view--border': content.isCompleted },
        { 'm-video-card__quick-view-bg': content.isFuture },
      )}
      onClick={handleClick}
    >
      <img
        src={content.isFuture ? whiteEyeIcon : eyeIcon}
        alt="view icon"
      />
      <div className={classNames(
        'h5 m-l-10 m-t-3',
        {
          'm-up-next-card__quick-view--text':
            content.isUpcoming || content.isCompleted,
        },
      )}
      >
        Quick View
      </div>
    </Tappable>
  );
};

export default observer(ViewComposedVideoButton);
