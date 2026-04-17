import React from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import ActiveQuestions from './ActiveQuestions';
import CompletedQuestions from './CompletedQuestions';

function QuestionTabs({ meetingStore: store }) {
  const { meeting } = store;

  if (meeting.filteredQuestions.length > 0) {
    switch (meeting.activeQuestionTab) {
      case 'active':
        return <ActiveQuestions />;
      case 'completed':
        return <CompletedQuestions />;
      default:
        return null;
    }
  } else {
    let message = 'There are no active questions';
    if (meeting.activeQuestionTab === 'completed') {
      message = 'Answered questions will be visible here';
    }

    return <HintLayout message={message} />;
  }
}

export default mobxify('meetingStore')(QuestionTabs);
