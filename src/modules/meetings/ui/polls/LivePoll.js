import React, { useCallback, useEffect } from 'react';

import { dialog } from '@common/ui/general/Dialog';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import LivePollMain from './LivePollMain';
import LivePollMini from './LivePollMini';

const POLL_SUBMISSION_TIMEOUT = 3000;

const RESPONSES_POLL_INTERVAL = 3000; // In ms

function Poll({ meetingStore: store }) {
  const { meeting } = store;
  const { manager } = meeting;
  const { poll } = manager;

  useEffect(() => {
    if (meeting.isSuperHost && poll.isActive) {
      const interval = setInterval(() => {
        poll.loadAllResponses();
      }, RESPONSES_POLL_INTERVAL);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [meeting.isSuperHost, poll, poll.isActive]);

  useEffect(() => {
    if (poll.isSubmitted) {
      const timeout = setTimeout(() => {
        manager.dropPoll();
      }, POLL_SUBMISSION_TIMEOUT);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [manager, poll.isSubmitted]);

  useEffect(() => {
    if (poll.isResultPublished || (poll.isEnded && !poll.isPublisher)) {
      manager.dropPoll();
    }
  }, [manager, poll.isEnded, poll.isPublisher, poll.isResultPublished]);

  const handleEnd = useCallback(() => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will end the poll even before the timer ends for '
        + 'all audience',
      onOk: () => poll.endOnServer(),
    });
  }, [poll]);

  return (
    poll.isMinimized ? (
      <LivePollMini handleEnd={handleEnd} />
    ) : (
      <LivePollMain handleEnd={handleEnd} />
    )
  );
}

export default mobxify('meetingStore')(Poll);
