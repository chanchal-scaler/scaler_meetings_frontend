import React from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import { Tappable } from '@common/ui/general';
import analytics from '~meetings/analytics';
import eyeIcon from '~meetings/images/eye.svg';

const ViewCueCardButton = ({ content }) => {
  const handleClick = () => {
    analytics.click(CUE_CARD_TRACKING.cueCardQuickView,
      'Live Meeting', {
        cue_card_name: content?.name,
        cue_card_order: content?.order,
        meeting_name: content?.playlist?.meeting?.name,
        hosts: content?.playlist?.meeting?.namesFromAllHosts,
        meeting_date_time: content?.playlist?.meeting?.startTime,
      });
    content.setQuickViewOpen(true);
  };

  return (
    <Tappable
      className={classNames(
        'row m-up-next-card__quick-view',
        { 'm-up-next-card__quick-view--border': !content.isUpcoming },
      )}
      onClick={handleClick}
    >
      <img
        src={eyeIcon}
        alt="view icon"
      />
      <div className="h5 m-l-10 m-t-3 m-up-next-card__quick-view--text">
        Quick View
      </div>
    </Tappable>
  );
};

export default observer(ViewCueCardButton);
