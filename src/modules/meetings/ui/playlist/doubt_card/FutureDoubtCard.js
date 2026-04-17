import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { dialog } from '@common/ui/general/Dialog';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import startIcon from '~meetings/images/start-icon.svg';

const FutureDoubtCard = ({ content }) => {
  const title = content.isUpcoming ? 'Up Next >>' : 'Doubt Resolution';
  const canControlPlaylist = content?.playlist?.meeting?.canControlPlaylist;

  const handleStartClick = () => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will start doubt session'
        + 'and attendance for doubt sessions is not considered',
      okLabel: 'Start Doubt Session',
      okClass: 'm-topic-card__ok-btn',
      onOk: () => content.play(),
    });
  };

  return (
    <div className={classNames(
      'm-up-next-card m-doubt-card__last-card',
      { 'm-up-next-card__audience': !canControlPlaylist },
    )}
    >
      <div className="m-topic-card__section row">
        <div className="m-doubt-card__bg-img">
          <div className="m-doubt-card__section p-15">
            <div className="row m-b-5 m-topic-card__header">
              <div className="h5 m-t-5">
                {title}
              </div>
            </div>
            <div className="h5">
              5 to 10 Mins to clear doubts.
            </div>
          </div>
        </div>

        {canControlPlaylist && (
          <div className="p-20 m-t-20">
            <div
              className="row m-up-next-card__start m-doubt-card__start"
              onClick={handleStartClick}
              role="presentation"
            >
              <img
                src={startIcon}
                alt="start icon"
              />
              <div className="h5 m-l-10 m-t-3">
                Start
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default observer(FutureDoubtCard);
