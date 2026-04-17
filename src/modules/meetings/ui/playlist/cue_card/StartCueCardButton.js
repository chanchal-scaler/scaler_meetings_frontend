import React, { useCallback } from 'react';
import { observer } from 'mobx-react';

import { CUE_CARD_TRACKING, SINGLETONS_NAME } from '~meetings/utils/constants';
import { dialog } from '@common/ui/general/Dialog';
import { Tappable } from '@common/ui/general';
import analytics from '~meetings/analytics';
import startIcon from '~meetings/images/start-icon.svg';

const StartCueCardButton = ({ content }) => {
  const handleContentSelect = useCallback(async () => {
    content.play();
  }, [content]);

  const handleStartClick = () => {
    if (!content.isUpcoming) {
      analytics.click(CUE_CARD_TRACKING.cueCardForceStart,
        'Live Meeting', {
          cue_card_name: content?.name,
          cue_card_order: content?.order,
          meeting_name: content?.playlist?.meeting?.name,
          hosts: content?.playlist?.meeting?.namesFromAllHosts,
          meeting_date_time: content?.playlist?.meeting?.startTime,
        });
      dialog.areYouSure({
        name: SINGLETONS_NAME,
        content: 'Proceeding will switch to the topic selected by you'
        + ' and a bookmark will be created for this',
        okLabel: 'Yes, Start Topic',
        okClass: 'm-topic-card__ok-btn',
        onOk: () => {
          analytics.click(CUE_CARD_TRACKING.cueCardYesForceStart,
            'Live Meeting', {
              cue_card_name: content?.name,
              cue_card_order: content?.order,
              meeting_name: content?.playlist?.meeting?.name,
              hosts: content?.playlist?.meeting?.namesFromAllHosts,
              meeting_date_time: content?.playlist?.meeting?.startTime,
            });
          handleContentSelect();
        },
        onCancel: () => {
          analytics.click(CUE_CARD_TRACKING.cueCardNoCancel,
            'Live Meeting', {
              cue_card_name: content?.name,
              cue_card_order: content?.order,
              meeting_name: content?.playlist?.meeting?.name,
              hosts: content?.playlist?.meeting?.namesFromAllHosts,
              meeting_date_time: content?.playlist?.meeting?.startTime,
            });
        },
        onfocus: () => {
          analytics.click(CUE_CARD_TRACKING.cueCardForceStartPopup,
            'Live Meeting', {
              cue_card_name: content?.name,
              cue_card_order: content?.order,
              meeting_name: content?.playlist?.meeting?.name,
              hosts: content?.playlist?.meeting?.namesFromAllHosts,
              meeting_date_time: content?.playlist?.meeting?.startTime,
            });
        },
      });
    } else {
      analytics.click(CUE_CARD_TRACKING.cueCardStartTopic,
        'Cue Card Start Topic', {
          cue_card_name: content?.name,
          cue_card_order: content?.order,
          meeting_name: content?.playlist?.meeting?.name,
          hosts: content?.playlist?.meeting?.namesFromAllHosts,
          meeting_date_time: content?.playlist?.meeting?.startTime,
        });
      handleContentSelect();
    }
  };

  return (
    <Tappable
      className="m-b-10 row m-up-next-card__start"
      onClick={handleStartClick}
      disabled={content.isStarting}
    >
      <img
        src={startIcon}
        alt="start icon"
      />
      <div className="h5 m-l-10 m-t-3">
        Start Topic
      </div>
    </Tappable>
  );
};

export default observer(StartCueCardButton);
