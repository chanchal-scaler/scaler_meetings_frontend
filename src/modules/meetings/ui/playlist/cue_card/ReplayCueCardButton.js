import React, { useCallback } from 'react';
import { observer } from 'mobx-react';

import { CUE_CARD_TRACKING, SINGLETONS_NAME } from '~meetings/utils/constants';
import { dialog } from '@common/ui/general/Dialog';
import { Tappable, Icon } from '@common/ui/general';
import analytics from '~meetings/analytics';

const ReplayCueCardButton = ({ content }) => {
  const handleContentSelect = useCallback(async () => {
    content.play();
  }, [content]);

  const handleReplyClick = () => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will replay the Card for learners',
      okLabel: 'Replay',
      okClass: 'm-topic-card__ok-btn',
      onOk: () => {
        analytics.click(CUE_CARD_TRACKING.cueCardReplayTopic,
          'Cue Card Replay Topic', {
            cue_card_name: content?.name,
            cue_card_order: content?.order,
            meeting_name: content?.playlist?.meeting?.name,
            hosts: content?.playlist?.meeting?.namesFromAllHosts,
            meeting_date_time: content?.playlist?.meeting?.startTime,
          });
        handleContentSelect();
      },
    });
  };

  if (content.isCompleted) {
    return (
      <Tappable
        className="tappable m-v-10 row m-up-next-card__replay"
        onClick={handleReplyClick}
      >
        <Icon name="refresh m-r-5" />
        <span className="m-up-next-card__replay-text">
          Replay
        </span>
      </Tappable>
    );
  } else {
    return null;
  }
};

export default observer(ReplayCueCardButton);
