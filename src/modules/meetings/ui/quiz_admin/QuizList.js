import React, { useEffect, useCallback } from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { HintLayout } from '@common/ui/layouts';
import QuizTrailer from './QuizTrailer';
import LoadingSkeleton from './LoadingSkeleton';


function QuizList({ quizStore: store }) {
  useEffect(() => {
    if (store.isHQOpen && !store.isLoadedAll) {
      store.loadAll();
    }
  }, [store, store.isHQOpen]);

  const handleScroll = useCallback((event) => {
    const node = event.target;
    if (node.scrollTop + node.clientHeight
      >= node.scrollHeight && store.hasMoreAll
    ) {
      store.nextPage();
    }
  }, [store]);

  function contentUi() {
    if (store.allProblemCount > 0) {
      return (
        store.problemsAll.map((problem) => (
          <QuizTrailer
            key={problem.id}
            className="m-v-10"
            problem={problem}
          />
        )));
    } else if (store.loadErrorAll) {
      return (
        <HintLayout
          actionFn={() => store.loadAll({ forceServer: true })}
          message="Failed to load quizzes"
        />
      );
    } else if (store.isLoadedAll) {
      return (
        <HintLayout
          message="No quizzes Found."
        />
      );
    } else {
      return null;
    }
  }
  return (
    <div
      className="mcq-hq-list"
      onScroll={handleScroll}
    >
      <>
        {contentUi()}
        {store.isLoadingAll && <LoadingSkeleton />}
      </>
    </div>
  );
}

export default mobxify('quizStore')(QuizList);
