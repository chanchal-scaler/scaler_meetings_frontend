import React, { useEffect } from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import LoadingSkeleton from './LoadingSkeleton';
import QuizTrailer from './QuizTrailer';

function QuizListLaunched({ quizStore: store }) {
  useEffect(() => {
    if (store.isHQOpen && !store.isLoadedLaunched) {
      store.loadLaunched();
    }
  }, [store, store.isHQOpen]);

  function itemUi(problem) {
    return (
      <QuizTrailer
        key={problem.id}
        className="m-v-10"
        problem={problem}
      />
    );
  }
  if (store.launchedProblemCount > 0) {
    return (
      <div className="mcq-hq-list">
        {store.problemsLaunched.map(itemUi)}
      </div>
    );
  } else if (store.loadErrorLaunched) {
    return (
      <HintLayout
        actionFn={() => store.loadLaunched({ forceServer: true })}
        message="Failed to load quizzes"
      />
    );
  } else if (store.isLoadingLaunched) {
    return (
      <div className="mcq-hq-list">
        <LoadingSkeleton />
      </div>
    );
  } else {
    return (
      <HintLayout
        message="No Launched quizzes Found."
      />
    );
  }
}

export default mobxify('quizStore')(QuizListLaunched);
