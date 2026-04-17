import React, { useCallback } from 'react';
import classNames from 'classnames';

import { ArchiveQuizList } from '~meetings/ui/quiz';
import { isPreRecordedCourse, meetingTypeLabel } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { IconButton } from '~meetings/ui/general';
import CustomHeaderActions from '~meetings/ui/CustomHeaderActions';

function Header({ meetingStore: store, leftActions }) {
  const { archive } = store;
  const { isLeaderboardOpen } = archive;

  const handleLeaderboardToggle = useCallback(() => {
    archive.setLeaderboardOpen(!isLeaderboardOpen);
  }, [isLeaderboardOpen, archive]);

  function leaderboardUi() {
    if (isPreRecordedCourse()) {
      return null;
    }

    // if (archive.quizzes.length > 0) {
    return (
      <IconButton
        className="m-header__action"
        icon="trophy"
        label="View leaderboard"
        popoverProps={{
          placement: 'bottom',
        }}
        data-cy="archived-meetings-leaderboard-button"
        onClick={handleLeaderboardToggle}
      />
    );
    // } else {
    //   return null;
    // }
  }

  return (
    <div
      className={classNames(
        'm-header',
        { 'm-header--small': archive.quizzes.length > 0 },
      )}
      data-cy="archived-meetings-header"
    >
      {leftActions?.length > 0 && (
        <div className="m-header__actions m-header__actions--left">
          <CustomHeaderActions actions={leftActions} mode="archive" />
        </div>
      )}
      <div className="m-header__main">
        <div className="m-header__title">
          {meetingTypeLabel(archive.type)}
          {' '}
          |
          {' '}
          {archive.name}
        </div>
        <ArchiveQuizList />
      </div>
      <div className="m-header__actions">
        {!archive.config?.autoStartArchiveQuiz && leaderboardUi()}
      </div>
    </div>
  );
}

export default mobxify('meetingStore')(Header);
