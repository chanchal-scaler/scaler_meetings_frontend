import { useEffect } from 'react';

import {
  addNudgeToView, GENERIC_NUDGE_TYPES, removeNudgeFromView,
  POLL_MISSED_NUDGE_TIMEOUT,
} from '~meetings/utils/genericNudge';

function usePollMissedActions({ meeting }) {
  const { manager } = meeting;
  const { poll } = manager || {};

  const genericNudgesEnabled = meeting.config?.genericNudgesEnabled;

  useEffect(() => {
    if (
      genericNudgesEnabled && !meeting.isHost
      && poll?.isEnded && poll?.myChoiceIndices?.length === 0
    ) {
      const nudgeTimeout = setTimeout(() => {
        // nudge data
        const nudge = {
          nudgeType: GENERIC_NUDGE_TYPES.PollMissedNudge,
          nudgeProps: {
            title: 'Poll Participation Needed 🔈',
            description: `Missed out on the last poll? Don't worry! 
            Join the next one and let your voice be heard.`,
            ctaTitle: 'I’ll Participate',
            ctaCallback: removeNudgeFromView,
          },
        };
        // firing nudge
        addNudgeToView(nudge);

        return () => clearTimeout(nudgeTimeout);
      }, POLL_MISSED_NUDGE_TIMEOUT);
    }
  }, [
    meeting.isHost, meeting.isSuperHost,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    poll, poll?.isEnded, poll?.myChoiceIndices, genericNudgesEnabled,
  ]);
}

export default usePollMissedActions;
