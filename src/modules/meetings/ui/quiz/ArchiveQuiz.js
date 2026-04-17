import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { autorun } from '~meetings/shared_modules/mobx';

import { mobxify } from '~meetings/ui/hoc';
import {
  ProblemDescription,
  ProblemChoices,
  ProblemResponses,
} from '~meetings/ui/problem';
import { TimeElapsed } from '~meetings/ui/general';
import { Icon, Tappable } from '@common/ui/general';
import QuizTimer from './QuizTimer';

const ALL_RESPONSES_TIMEOUT = 4000; // In ms

const LEADERBOARD_VISIBLE_TIME = 5000; // In ms

function ArchiveQuiz({ meetingStore: store }) {
  const { archive } = store;
  const { quiz } = archive;

  const quizRef = useRef(null);

  useEffect(() => {
    if (quiz.isEnded && quiz.resultShown) {
      const timeout = setTimeout(() => {
        quizRef.current = quiz;
        archive.dropQuiz();

        if (archive.config?.autoStartArchiveQuiz) {
          archive.setLeaderboardOpen(false);
        } else {
          archive.setLeaderboardOpen(true, LEADERBOARD_VISIBLE_TIME);
        }
      }, ALL_RESPONSES_TIMEOUT);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [archive, quiz, quiz.isEnded, quiz.resultShown]);

  useEffect(() => {
    autorun(() => {
      const oldQuiz = quizRef.current;
      if (!archive.isLeaderboardOpen && oldQuiz && oldQuiz.activeInLive) {
        oldQuiz.skip();
        quizRef.current = null;
      }
    });
  }, [archive.isLeaderboardOpen]);

  function submissionUi() {
    if (quiz.isAttempted) {
      return (
        <div className="m-quiz__small-text m-t-5 success">
          Answered in
          {' '}
          {(quiz.timeToSolve / 1000).toFixed(1)}
          {' '}
          seconds
        </div>
      );
    } else {
      return null;
    }
  }

  function choicesUi() {
    if (quiz.isEnded) {
      return (
        <div className="m-quiz__responses relative">
          <ProblemResponses
            choices={quiz.choices}
            correctIndex={quiz.correctChoiceIndex}
            distribution={quiz.choiceDistribution}
            selectedIndex={quiz.myChoiceIndex}
            totalResponses={quiz.totalResponses}
            hideDistribution={archive.config?.autoStartArchiveQuiz}
          />
          {submissionUi()}
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

  function quizSessionStatusUi() {
    if (quiz.sessionStatus === 'completed') {
      return (
        <div className="m-quiz__small-text m-t-5 italic">
          (Since you've already attempted the quiz before,
          <br />
          this attempt wouldn't update your score)
        </div>
      );
    }
    return null;
  }

  function mainUi() {
    return (
      <div className="m-quiz__main-inner">
        <h1 className="dark bold">Quiz time!</h1>
        {!archive.config?.autoStartArchiveQuiz && (
          <QuizTimer
            timeLeft={quiz.timeLeft}
            isEnded={quiz.isEnded}
          />
        )}
        <div className="m-quiz__problem">
          <ProblemDescription
            className="m-b-20"
            description={quiz.description}
          />
          {choicesUi()}
          {!archive.config?.autoStartArchiveQuiz && quizSessionStatusUi()}
        </div>
      </div>
    );
  }

  function closeUi() {
    return (
      <Tappable
        className="btn btn-icon btn-inverted btn-round m-leaderboard__close"
        onClick={() => archive.dropQuiz()}
      >
        <Icon name="clear" />
      </Tappable>
    );
  }

  return (
    <div className="m-quiz">
      {!archive.config?.autoStartArchiveQuiz && (
        <TimeElapsed
          className={classNames(
            { invisible: quiz.showLeaderboard },
          )}
          duration={quiz.duration}
          timeElapsed={quiz.timeElapsed}
        />
      )}
      <div className="m-quiz__main">
        {quiz.isEnded && quiz.resultShown && closeUi()}
        {mainUi()}
      </div>
    </div>
  );
}

export default mobxify('meetingStore')(ArchiveQuiz);
