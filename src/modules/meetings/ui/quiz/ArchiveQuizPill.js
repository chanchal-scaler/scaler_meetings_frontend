import React, {
  useRef,
  useCallback,
  useEffect,
} from 'react';
import classNames from 'classnames';

import { mobxify } from '~meetings/ui/hoc';
import { toCountdown } from '~video_player/utils/date';
import { Icon, Popover, Tappable } from '@common/ui/general';

function ArchiveQuizPill({ quiz, meetingStore: store }) {
  const ref = useRef(null);
  const { archive } = store;
  const { popoverActiveQuiz } = archive;
  const isPopoverOpen = !archive.quiz && !archive.isLeaderboardOpen && (
    quiz.showPopover
    || (quiz.activeInLive && !quiz.resultShown)
  ) && (!popoverActiveQuiz || popoverActiveQuiz.id === quiz.id);
  const highlightPill = isPopoverOpen
    || (archive.quiz && archive.quiz.id === quiz.id);

  const showPopover = () => {
    archive.askToLaunchQuiz(quiz);
  };

  const closePopover = useCallback(() => {
    quiz.setPopover(false);
  }, [quiz]);

  const launchQuiz = useCallback(() => {
    closePopover();
    archive.launchQuiz(quiz);
  }, [archive, quiz, closePopover]);

  const shouldAutoLaunchQuiz = useCallback(() => (
    archive.config?.autoStartArchiveQuiz
    && quiz.activeInLive
    && !quiz.sessionStatus
  ), [archive.config, quiz.activeInLive, quiz.sessionStatus]);

  useEffect(() => {
    if (shouldAutoLaunchQuiz()) {
      launchQuiz();
    }
  }, [shouldAutoLaunchQuiz, launchQuiz]);

  function launchBtnUi() {
    return (
      <Tappable
        onClick={launchQuiz}
        className="btn btn-primary m-quiz__popover-btn"
      >
        Launch
      </Tappable>
    );
  }

  function autoInitQuizUi() {
    return (
      <>
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
          {launchBtnUi()}
        </div>
      </>
    );
  }

  function manualInitQuizUi() {
    return (
      <>
        <span className="m-quiz__popover-header">
          Do you wish to launch the Quiz?
        </span>
        <div className="m-quiz__popover-footer">
          <Tappable
            onClick={closePopover}
            className="btn btn-inverted m-r-5 m-quiz__popover-btn"
          >
            Cancel
          </Tappable>
          {launchBtnUi()}
        </div>
      </>
    );
  }

  function popoverUi() {
    return (
      <Popover
        anchorRef={ref}
        isOpen={isPopoverOpen}
        onClose={closePopover}
        placement="bottom"
        className="m-quiz__popover"
        extraScope="meeting-app"
      >
        { quiz.activeInLive ? autoInitQuizUi()
          : manualInitQuizUi()}
      </Popover>
    );
  }

  function pillUi() {
    return (
      <>
        {quiz.name}
        {' '}
        (
        {toCountdown(quiz.relativeStartTime / 1000)}
        )
        {
          quiz.sessionStatus
          && (
            <Icon
              className="m-l-5"
              name="tick"
            />
          )
        }
      </>
    );
  }

  return (
    <>
      <Tappable
        ref={ref}
        className={classNames(
          'm-quiz__pill',
          { 'm-quiz__pill--active': highlightPill },
        )}
        onClick={quiz.isEnded ? launchQuiz : showPopover}
      >
        {pillUi()}
      </Tappable>
      {popoverUi()}
    </>
  );
}

export default mobxify('meetingStore')(ArchiveQuizPill);
