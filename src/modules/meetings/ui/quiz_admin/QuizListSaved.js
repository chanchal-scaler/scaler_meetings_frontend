import React, { useEffect, useCallback } from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import QuizTrailer from './QuizTrailer';
import LoadingSkeleton from './LoadingSkeleton';


function QuizListSaved({ quizStore: store }) {
  useEffect(() => {
    if (store.isHQOpen && !store.isLoadedSaved) {
      store.loadSaved();
    }
  }, [store, store.isHQOpen]);

  const handleScroll = useCallback((event) => {
    const node = event.target;
    if (node.scrollTop + node.clientHeight
      >= node.scrollHeight && store.hasMoreSaved
    ) {
      store.nextSavedPage();
    }
  }, [store]);

  function contentUi() {
    if (store.savedProblemCount > 0) {
      return (
        store.problemsSaved.map((problem) => (
          <QuizTrailer
            key={problem.id}
            className="m-v-10"
            problem={problem}
          />
        )));
    } else if (store.loadErrorSaved) {
      return (
        <HintLayout
          actionFn={() => store.loadSaved({ forceServer: true })}
          message="Failed to load Saved quizzes."
        />
      );
    } else if (store.isLoadedSaved) {
      return (
        <HintLayout
          message="No Saved quizzes Found."
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
        {store.isLoadingSaved && <LoadingSkeleton />}
      </>
    </div>
  );
}

export default mobxify('quizStore')(QuizListSaved);
