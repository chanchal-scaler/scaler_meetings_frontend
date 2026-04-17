import React, { useEffect } from 'react';

import { mobxify } from '~meetings/ui/hoc';
import QuizPill from './ArchiveQuizPill';

function ArchiveQuizList({ meetingStore: store }) {
  const { archive } = store;

  useEffect(() => {
    archive.loadQuizzes();
  }, [archive]);

  if (archive.quizzes.length > 0) {
    return (
      <div className="m-quiz__list">
        <span className="m-quiz__list-title">All Quizzes</span>
        {archive.quizzes.map(quiz => (
          <QuizPill
            key={quiz.id}
            quiz={quiz}
          />
        ))}
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(ArchiveQuizList);
