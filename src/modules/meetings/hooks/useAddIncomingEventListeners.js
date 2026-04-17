import { useCallback } from 'react';

import { useAddEventListener } from '@common/hooks';

import incomingMeetingEvents from '~meetings/incoming_events';

function useAddIncomingEventListeners(meeting) {
  const endLiveMeeting = useCallback(async (event) => {
    const eventData = event.detail?.data;
    const endType = eventData?.endType;
    meeting.end(endType);
  }, [meeting]);

  const handleAddMessageToNoticeBoard = useCallback(async (event) => {
    const eventData = event.detail?.data;

    meeting.noticeBoard?.pinCustomMessage(eventData);
  }, [meeting]);

  useAddEventListener({
    eventType: incomingMeetingEvents.END_LIVE_MEETING,
    callback: endLiveMeeting,
  });

  useAddEventListener({
    eventType: incomingMeetingEvents.ADD_MESSAGE_TO_NOTICE_BOARD,
    callback: handleAddMessageToNoticeBoard,
  });
}

export default useAddIncomingEventListeners;
