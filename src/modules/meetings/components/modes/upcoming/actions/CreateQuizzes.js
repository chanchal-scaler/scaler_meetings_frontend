import React from 'react';
import classNames from 'classnames';

import { canCreatePollAndQuiz } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { QuizHQ } from '~meetings/ui/quiz_admin';
import { Tappable } from '@common/ui/general';

function CreateQuizzes({
  className,
  meetingStore: store,
  quizStore,
  ...remainingProps
}) {
  if (store.isSuperHost && canCreatePollAndQuiz(store.data.type)) {
    return (
      <>
        <Tappable
          className={classNames(
            'btn btn-primary',
            { [className]: className },
          )}
          data-cy="meetings-upcoming-create-quiz-btn"
          onClick={() => quizStore.setHQOpen(true)}
          {...remainingProps}
        >
          Create Quizzes
        </Tappable>
        <QuizHQ />
      </>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'quizStore')(CreateQuizzes);
