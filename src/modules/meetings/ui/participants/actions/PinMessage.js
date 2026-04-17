import React, { useCallback } from 'react';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';

function PinMessage({ meetingStore, messageBody }) {
  const { meeting } = meetingStore;
  const { noticeBoard } = meeting;

  const handlePin = useCallback(() => {
    noticeBoard.setNoticeBoardMessageDescription(messageBody);
    noticeBoard.pinMessage();
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardAddButtonClick,
      click_source: DRONA_SOURCES.meetingChatWindow,
      click_feature: DRONA_FEATURES.noticeBoard,
    });
  }, [messageBody, noticeBoard]);

  if (meeting && meeting.noticeBoard && meeting.isSuperHost) {
    return (
      <Tappable
        className="btn btn-small btn-inverted btn-sharp"
        onClick={handlePin}
      >
        Pin Message
      </Tappable>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(PinMessage);
