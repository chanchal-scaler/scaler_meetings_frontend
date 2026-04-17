import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import Question from './Question';

function CompletedQuestions({ meetingStore: store }) {
  const { meeting } = store;
  return (
    <div
      key="completed"
      className="column m-10"
    >
      {meeting.sortedQuestions.map((question) => (
        <Question
          key={question.id}
          question={question}
        />
      ))}
    </div>
  );
}

export default mobxify('meetingStore')(CompletedQuestions);
