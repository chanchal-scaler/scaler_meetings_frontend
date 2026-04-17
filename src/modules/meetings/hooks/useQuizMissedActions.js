import { useEffect } from 'react';

import {
  addNudgeToView, GENERIC_NUDGE_TYPES, removeNudgeFromView,
  QUIZ_MISSED_NUDGE_TIMEOUT,
} from '~meetings/utils/genericNudge';

function useQuizMissedActions({ meeting }) {
  const { manager } = meeting;
  const { quiz } = manager || {};

  const genericNudgesEnabled = meeting.config?.genericNudgesEnabled;

  useEffect(() => {
    if (
      genericNudgesEnabled && !meeting.isHost
      && quiz?.isEnded && quiz?.myChoiceIndex === null
    ) {
      const nudgeTimeout = setTimeout(() => {
        const nudge = {
          nudgeType: GENERIC_NUDGE_TYPES.QuizMissedNudge,
          nudgeProps: {
            title: 'Saw You Skipped the Quiz 👀',
            description: `No problem! There are more opportunities ahead.
             Look out for the next quiz!`,
            ctaTitle: 'I’ll be ready for the next quiz',
            ctaCallback: removeNudgeFromView,
          },
        };
        addNudgeToView(nudge);

        return () => clearTimeout(nudgeTimeout);
      }, QUIZ_MISSED_NUDGE_TIMEOUT);
    }
  }, [
    meeting.isHost, meeting.isSuperHost,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    quiz, quiz?.isEnded, quiz?.myChoiceIndex, genericNudgesEnabled,
  ]);
}

export default useQuizMissedActions;
