import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';

import { dialog } from '@common/ui/general/Dialog';
import { mobxify } from '~meetings/ui/hoc';
import {
  ProblemDescription,
  ProblemChoices,
  ProblemResponses,
} from '~meetings/ui/problem';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { TimeElapsed } from '~meetings/ui/general';
import QuizTimer from './QuizTimer';

const RESPONSES_POLL_INTERVAL = 3000; // In ms

const LEADERBOARD_VISIBLE_TIME = 5000; // In ms

const ALL_RESPONSES_TIMEOUT = 8000; // In ms

function LiveQuiz({ meetingStore: store }) {
  const { meeting } = store;
  const { manager } = meeting;
  const { quiz } = manager;

  useEffect(() => {
    if (meeting.isSuperHost && quiz.isActive) {
      const interval = setInterval(() => {
        quiz.loadAllResponses();
      }, RESPONSES_POLL_INTERVAL);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [meeting.isSuperHost, quiz, quiz.isActive]);

  useEffect(() => {
    if (quiz.isEnded) {
      const timeout = setTimeout(() => {
        manager.dropQuiz();
        manager.setLeaderboardOpen(true, LEADERBOARD_VISIBLE_TIME);
      }, ALL_RESPONSES_TIMEOUT);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [manager, quiz.isEnded]);

  const handleEnd = useCallback(() => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will end the quiz even before the timer ends for '
        + 'all audience',
      onOk: () => quiz.endOnServer(),
    });
  }, [quiz]);

  function endUi() {
    if (meeting.isSuperHost && !quiz.isEnded) {
      return (
        // eslint-disable-next-line
        <a
          className="m-quiz__float m-primary"
          onClick={handleEnd}
        >
          End Quiz Now
        </a>
      );
    } else {
      return null;
    }
  }

  function submissionUi() {
    if (quiz.isAttempted) {
      return (
        <span className="m-quiz__float success">
          Answered in
          {' '}
          {(quiz.timeToSolve / 1000).toFixed(1)}
          {' '}
          seconds
        </span>
      );
    } else {
      return null;
    }
  }

  function choicesUi() {
    if (quiz.isEnded || meeting.isSuperHost) {
      return (
        <div className="m-quiz__responses relative">
          <ProblemResponses
            choices={quiz.choices}
            correctIndex={quiz.correctChoiceIndex}
            distribution={quiz.choiceDistribution}
            selectedIndex={quiz.myChoiceIndex}
            totalResponses={quiz.totalResponses}
            hideDistribution={false}
          />
          {endUi()}
        </div>
      );
    } else {
      return (
        <div className="m-quiz__choices relative">
          <ProblemChoices
            choices={quiz.choices}
            isLocked={quiz.isAttempted}
            onSelect={quiz.handleSubmission}
            selectedIndex={quiz.myChoiceIndex}
          />
          {submissionUi()}
        </div>
      );
    }
  }

  function mainUi() {
    return (
      <div className="m-quiz__main-inner">
        <h1 className="dark bold">Quiz time!</h1>
        <QuizTimer
          timeLeft={quiz.timeLeft}
          isEnded={quiz.isEnded}
        />
        <div className="m-quiz__problem">
          <ProblemDescription
            className="m-b-20"
            description={quiz.description}
          />
          {choicesUi()}
        </div>
      </div>
    );
  }

  return (
    <div className="m-quiz">
      <TimeElapsed
        className={classNames(
          { invisible: quiz.showLeaderboard },
        )}
        duration={quiz.duration}
        timeElapsed={quiz.timeElapsed}
      />
      <div className="m-quiz__main">
        {mainUi()}
      </div>
    </div>
  );
}

export default mobxify('meetingStore')(LiveQuiz);
