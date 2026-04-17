import React, { useEffect } from 'react';
import classNames from 'classnames';

import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import AiSidekick from './AiSidekick';
import QuestionInput from './QuestionInput';
import QuestionListControls from './QuestionListControls';
import QuestionTabBar from './QuestionTabBar';
import QuestionTabs from './QuestionTabs';
import QuestionWithBotResponse from './QuestionWithBotResponse';

function Questions({ meetingStore: store }) {
  const { meeting } = store;

  useEffect(() => {
    meeting.loadQuestions();
  }, [meeting]);

  const {
    isStandaloneQuestionVsisble,
    questionWithPendingInteraction: pendingQuestion,
  } = meeting;

  if (meeting.areQuestionsLoaded) {
    return (
      <div className="m-questions layout">
        <div className="layout__header column">
          <QuestionTabBar />
          <QuestionListControls />
        </div>
        {!isStandaloneQuestionVsisble ? (
          <>
            <div
              className={classNames(
                'layout__content',
              )}
            >
              <QuestionTabs />
            </div>
            <AiSidekick />
          </>
        ) : (
          <div className="layout__content m-sidekick-layout">
            <QuestionWithBotResponse
              question={pendingQuestion}
              showAudienceActions
            />
            <AiSidekick />
          </div>
        )}
        <div className="layout__footer">
          <QuestionInput />
        </div>
      </div>
    );
  } else if (meeting.isLoadingQuestions) {
    return <LoadingLayout />;
  } else if (meeting.questionsLoadError) {
    return (
      <HintLayout
        actionLabel="Try again"
        actionFn={() => meeting.loadQuestions()}
        message="Failed to load questions"
      />
    );
  }
}

export default mobxify('meetingStore')(Questions);
