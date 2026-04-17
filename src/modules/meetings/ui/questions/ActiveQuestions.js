import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import { humanizeTime } from '@common/utils/date';
import { mobxify } from '~meetings/ui/hoc';
import { QUESTION_RATE_LIMIT_TIMEOUT } from '~meetings/utils/question';
import Question from './Question';

function QuestionNote({ children }) {
  return (
    <div className="m-question-note">
      <span className="bold dark">Note: </span>
      {children}
    </div>
  );
}

function QuestionsEnabledNoteForHost() {
  return (
    <>
      Please click on “
      <span className="bold dark">Answer Now</span>
      ”
      button before you start explaining the doubt to perfectly map it
      with the classroom video.
    </>
  );
}

function QuestionsEnabledNoteForParticipant() {
  return (
    <>
      You can send one question in every "
      <span className="bold dark">
        {humanizeTime(QUESTION_RATE_LIMIT_TIMEOUT)}
      </span>
      " gap so that the host can address all the questions
    </>
  );
}

function QuestionsDisabledNoteForHost() {
  return (
    <>
      Questions have been disabled by the host.
    </>
  );
}


function QuestionsDisabledNoteForParticipant() {
  return (
    <>
      Questions have been disabled by the host.
    </>
  );
}

function getQuestionNote(isQuestionsDisabled, isSuperHost) {
  if (isQuestionsDisabled) {
    if (isSuperHost) {
      return <QuestionsDisabledNoteForHost />;
    }
    return <QuestionsDisabledNoteForParticipant />;
  }
  if (isSuperHost) {
    return <QuestionsEnabledNoteForHost />;
  }
  return <QuestionsEnabledNoteForParticipant />;
}

function ActiveQuestions({ meetingStore: store }) {
  const [animate, setAnimate] = useState(false);
  const { meeting } = store;
  const { manager } = meeting;

  let top = 0;
  let isHeightNotCalculated = false;
  const questionTopsMap = {};

  meeting.sortedQuestions.forEach((question) => {
    questionTopsMap[question.id] = top;
    if (question.height === null) {
      isHeightNotCalculated = true;
    } else {
      top += question.height;
    }
  });

  useEffect(() => {
    if (!animate && !isHeightNotCalculated) {
      // Disables the transform animation on mount
      setTimeout(() => {
        setAnimate(true);
      }, 1000);
    }
  }, [animate, isHeightNotCalculated]);

  return (
    <>
      <QuestionNote>
        {getQuestionNote(manager.isQuestionsDisabled, meeting.isSuperHost)}
      </QuestionNote>
      <div
        className={classNames(
          'column relative m-10',
          { 'opacity-0': isHeightNotCalculated },
        )}
      >
        {meeting.filteredQuestions.map((question) => (
          <Question
            key={question.id}
            className={classNames(
              'm-question-active',
              { 'm-question-active--animate': animate },
            )}
            measureHeight
            question={question}
            style={{
              transform: `translateY(${questionTopsMap[question.id]}px)`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export default mobxify('meetingStore')(ActiveQuestions);
