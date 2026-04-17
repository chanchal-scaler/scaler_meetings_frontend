import React, { useCallback } from 'react';
import { observer } from 'mobx-react';

import { CUE_CARD_TRACKING } from '~meetings/utils/constants';
import { Tappable } from '@common/ui/general';
import analytics from '~meetings/analytics';
import pauseIcon from '~meetings/images/pause-icon.svg';

const StopCueCardButton = ({ content }) => {
  const handleContentSelect = useCallback(async () => {
    content.stop();
  }, [content]);

  const handleStopClick = () => {
    analytics.click(CUE_CARD_TRACKING.cueCardStopTopic,
      'Cue Card Stop Topic', {
        cue_card_name: content?.name,
        cue_card_order: content?.order,
        meeting_name: content?.playlist?.meeting?.name,
        hosts: content?.playlist?.meeting?.namesFromAllHosts,
        meeting_date_time: content?.playlist?.meeting?.startTime,
      });
    handleContentSelect();
  };

  if (content.isActive) {
    return (
      <Tappable
        className="m-b-10 row m-topic-card-stop-button"
        onClick={handleStopClick}
        disabled={content.isStopping}
      >
        <img
          src={pauseIcon}
          alt="pause icon"
        />
        <div className="h5 m-l-10 m-t-5">
          Stop Sharing
        </div>
      </Tappable>
    );
  } else {
    return null;
  }
};

export default observer(StopCueCardButton);
