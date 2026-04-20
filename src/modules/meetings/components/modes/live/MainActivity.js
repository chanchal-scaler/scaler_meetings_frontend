import React, { useRef } from 'react';
import { Observer } from 'mobx-react';
import classNames from 'classnames';

import { ErrorBoundary } from '@common/ui/general';
import { Leaderboard, LiveQuiz } from '~meetings/ui/quiz';
import { LivePoll } from '~meetings/ui/polls';
import { MobilePanel } from '~meetings/ui/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { PollHQ } from '~meetings/ui/poll_admin';
import { QuizHQ } from '~meetings/ui/quiz_admin';
import { SurveyHQ } from '~meetings/ui/survey_admin';
import { useMediaQuery } from '@common/hooks';
import {
  useQuizMissedActions, usePollMissedActions,
  useDuringQuizActions, useDuringPollActions,
} from '~meetings/hooks';
import ActivePlaylistContentView from './ActivePlaylistContentView';
import GenericNudgeContainer
  from '~meetings/components/nudges/GenericNudgeContainer';
import LaunchProxyChatForm from '~meetings/ui/proxy_chat/LaunchProxyChatForm';
import LaunchProxyQuestionForm
  from '~meetings/ui/proxy_question/LaunchProxyQuestionForm';
import NoticeBoardForm from '~meetings/ui/notice_board/NoticeBoardForm';
import VideoChannel from './VideoChannel';

function MainActivity({ meetingStore: store, genericNudgeStore }) {
  const ref = useRef();
  const { mobile } = useMediaQuery();
  const { meeting } = store;
  const { manager, videoBroadcasting } = meeting;
  const isBottomCollapsed = (
    videoBroadcasting
    && videoBroadcasting.hasPinnedStream
  );
  const newNoticeBoardEnabled = meeting.config?.newNoticeBoardEnabled;

  useDuringPollActions({ meeting, genericNudgeStore });
  useDuringQuizActions({ meeting, genericNudgeStore });
  useQuizMissedActions({ meeting });
  usePollMissedActions({ meeting });

  function topUi() {
    return (
      <div
        className={classNames(
          'm-activity__top',
          { 'm-activity__top--expanded': isBottomCollapsed },
        )}
      >
        <VideoChannel />
        <ActivePlaylistContentView />
      </div>
    );
  }

  function bottomUi() {
    if (mobile && !isBottomCollapsed) {
      return (
        <div
          className={classNames(
            'm-activity__bottom',
            {
              'm-activity__bottom--expanded': meeting.shouldExpandMobilePanel,
            },
          )}
        >
          <MobilePanel />
        </div>
      );
    } else {
      return null;
    }
  }

  function noticeBoardFormUi() {
    if (newNoticeBoardEnabled && meeting.isSuperHost) {
      return <NoticeBoardForm />;
    } else {
      return null;
    }
  }

  function proxyChatFormUi() {
    if (meeting.isSuperHost) {
      return <LaunchProxyChatForm />;
    }
    return null;
  }

  function proxyQuestionFormUi() {
    if (meeting.isSuperHost) {
      return <LaunchProxyQuestionForm />;
    }
    return null;
  }

  function quizUi() {
    return (
      <>
        {manager.quiz && (
          <LiveQuiz key={manager.quiz.id} />
        )}
        {manager.poll && !manager.poll.isMinimized && (
          <LivePoll />
        )}
        <QuizHQ />
        <Observer>
          {() => (
            <Leaderboard
              isOpen={manager.isLeaderboardOpen}
              leaderboard={manager.leaderboard}
              myLeaderboardEntry={manager.myLeaderboardEntry}
              onClose={() => manager.setLeaderboardOpen(false)}
              numProblems={manager.numProblems}
            />
          )}
        </Observer>
      </>
    );
  }

  function pollUi() {
    return (
      <>
        <PollHQ />
      </>
    );
  }

  function surveyUi() {
    return <SurveyHQ />;
  }

  return (
    <div className="m-activity" ref={ref}>
      {topUi()}
      {bottomUi()}
      {quizUi()}
      {surveyUi()}
      {pollUi()}
      <ErrorBoundary>
        <GenericNudgeContainer popoverRef={ref} />
      </ErrorBoundary>
      {noticeBoardFormUi()}
      {proxyChatFormUi()}
      {proxyQuestionFormUi()}
    </div>
  );
}

export default mobxify('meetingStore', 'genericNudgeStore')(MainActivity);
