import React from 'react';

import { ArchiveQuiz, Leaderboard } from '~meetings/ui/quiz';
import { MobilePanel } from '~meetings/ui/archive';
import { isPreRecordedCourse } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { Modal, Tappable } from '@common/ui/general';
import Playlist from './Playlist';

function MainActivity({ meetingStore: store }) {
  const { archive } = store;

  function launchQuizModal() {
    const quiz = archive.activeInLiveQuiz;
    const isOpen = archive.isFullscreen && quiz
      && !archive.quiz && !archive.isLeaderboardOpen && !quiz.resultShown;

    if (quiz) {
      return (
        <Modal
          className="m-modal"
          isOpen={isOpen}
          canClose={false}
          title="Launch Quiz"
        >
          <span className="m-quiz__popover-header">
            {quiz.name}
            {' '}
            was lauched at this time during the class.
            {' '}
            Do you wish to launch it as well?
          </span>
          <div className="m-quiz__popover-footer">
            <Tappable
              onClick={quiz.skip}
              className="btn btn-inverted m-r-5 m-quiz__popover-btn"
            >
              Skip
            </Tappable>
            <Tappable
              onClick={() => archive.launchQuiz(quiz)}
              className="btn btn-primary m-quiz__popover-btn"
            >
              Launch
            </Tappable>
          </div>
        </Modal>
      );
    }
    return null;
  }

  return (
    <>
      <Playlist>
        {archive.quiz && (
          <ArchiveQuiz key={archive.quiz.id} />
        )}
        {!archive.config?.autoStartArchiveQuiz && (
          <Leaderboard
            isOpen={archive.isLeaderboardOpen && !isPreRecordedCourse()}
            leaderboard={archive.leaderboard}
            myLeaderboardEntry={archive.myLeaderboardEntry}
            onClose={() => archive.setLeaderboardOpen(false)}
            numProblems={archive.numProblems}
            virtualEntry={archive.myArchiveLeaderboardEntry}
          />
        )}
        {launchQuizModal()}
      </Playlist>
      <MobilePanel />
    </>
  );
}

export default mobxify('meetingStore')(MainActivity);
