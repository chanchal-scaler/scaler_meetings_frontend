import { useEffect } from 'react';

import {
  addNudgeToView, GENERIC_NUDGE_TYPES, removeNudgeFromView,
} from '~meetings/utils/genericNudge';

function useDuringQuizActions({ meeting, genericNudgeStore }) {
  const { manager } = meeting;
  const { quiz } = manager || {};

  const { currentNudge } = genericNudgeStore || {};

  const genericNudgesEnabled = meeting.config?.genericNudgesEnabled;

  // nudge to be launced at 60% of quiz duration while quiz is active
  useEffect(() => {
    if (genericNudgesEnabled && quiz?.isActive && !meeting.isHost) {
      const nudgeTimeout = setTimeout(() => {
        if (quiz?.myChoiceIndex === null && quiz?.isActive) {
          removeNudgeFromView();
          const nudge = {
            nudgeType: GENERIC_NUDGE_TYPES.QuizOngoingNudge,
            nudgeProps: {
              title: 'Final Call: Quiz Closing Soon! 🗳️',
              description: `Join your classmates – share your answer now!`,
            },
          };
          addNudgeToView(nudge);
        }

        return () => clearTimeout(nudgeTimeout);
      }, (quiz?.duration * 6) / 10);
    }
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    quiz, quiz?.isActive, meeting.isHost, quiz?.duration, genericNudgesEnabled,
  ]);

  useEffect(() => {
    if (
      genericNudgesEnabled && quiz?.myChoiceIndex !== null && !meeting.isHost
    ) {
      if (currentNudge?.nudgeType === GENERIC_NUDGE_TYPES.QuizOngoingNudge) {
        const nudge = {
          nudgeType: GENERIC_NUDGE_TYPES.QuizAttemptedNudge,
          nudgeProps: {
            title: '✅ Quiz Submitted Successfully',
            description: `Great job! Keep the momentum going!`,
          },
        };
        addNudgeToView(nudge);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, quiz?.myChoiceIndex, meeting.isHost, genericNudgesEnabled]);
}

export default useDuringQuizActions;
