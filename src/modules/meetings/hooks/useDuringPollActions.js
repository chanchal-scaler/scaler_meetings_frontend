import { useEffect } from 'react';

import {
  addNudgeToView, GENERIC_NUDGE_TYPES, removeNudgeFromView,
} from '~meetings/utils/genericNudge';

function useDuringPollActions({ meeting, genericNudgeStore }) {
  const { manager } = meeting;
  const { poll } = manager || {};

  const { currentNudge } = genericNudgeStore || {};

  const genericNudgesEnabled = meeting.config?.genericNudgesEnabled;

  // nudge to be launced at 50% of poll duration while poll is active
  useEffect(() => {
    if (genericNudgesEnabled && poll?.isActive && !meeting.isHost) {
      const nudgeTimeout = setTimeout(() => {
        if (poll?.myChoiceIndices?.length === 0 && poll?.isActive) {
          removeNudgeFromView();
          const nudge = {
            nudgeType: GENERIC_NUDGE_TYPES.PollOngoingNudge,
            nudgeProps: {
              title: 'Last Call: Vote Now! 🗳️',
              description: `Join your peers who've voted. Add your vote now!`,
            },
          };
          addNudgeToView(nudge);
        }

        return () => clearTimeout(nudgeTimeout);
      }, poll?.duration / 2);
    }
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    poll, poll?.isActive, meeting.isHost, poll?.duration, genericNudgesEnabled,
  ]);

  useEffect(() => {
    if (genericNudgesEnabled && poll?.isSubmitting && !meeting.isHost) {
      if (currentNudge?.nudgeType === GENERIC_NUDGE_TYPES.PollOngoingNudge) {
        const nudge = {
          nudgeType: GENERIC_NUDGE_TYPES.PollAttemptedNudge,
          nudgeProps: {
            title: 'Thanks for Voting! 🗳️',
            description: `Your opinion matters. Stay involved
             and keep dropping your votes`,
          },
        };
        addNudgeToView(nudge);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll, poll?.isSubmitting, meeting.isHost, genericNudgesEnabled]);
}

export default useDuringPollActions;
