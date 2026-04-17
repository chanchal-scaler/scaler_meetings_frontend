import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';
import classNames from 'classnames';

import { dialog } from '@common/ui/general/Dialog';
import { DRONA_TRACKING_TYPES } from '~meetings/utils/trackingEvents';
import {
  Icon, Tappable, Tooltip, VectorIcon,
} from '@common/ui/general';
import { QuestionStatus } from '~meetings/utils/question';
import { sendSubmitGTMEvent } from '@common/utils/gtm';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { timeSince, toHHmm } from '@common/utils/date';
import { toast } from '@common/ui/general/Toast';
import analytics from '@common/utils/analytics';
import MeetingParticipantActions from '~meetings/ui/MeetingParticipantActions';
import QuestionContent from './QuestionContent';
import QuestionWithBotResponse from './QuestionWithBotResponse';

const ResizeObserver = window.ResizeObserver || Polyfill;

function Question({
  className,
  question,
  measureHeight,
  message,
  timestamp,
  ...remainingProps
}) {
  const [areActionsOpen, setActionsOpen] = useState(false);
  const ref = useRef();
  const { meeting } = question;

  useEffect(() => {
    function handleDimensionsChange() {
      if (ref.current) {
        question.setHeight(ref.current.offsetHeight);
      }
    }

    if (measureHeight) {
      handleDimensionsChange();

      const resizeObserver = new ResizeObserver(handleDimensionsChange);
      resizeObserver.observe(ref.current, { box: 'border-box' });

      return () => {
        question.setHeight(null);
        resizeObserver.disconnect();
      };
    }

    return undefined;
    // Reason to add `question.responderType` is to re-calculate
    // height when responderType changes as it directly
    // affects the height of the question
  }, [measureHeight, question, question.responderType, question.botResponse]);

  const sendWithdrawSubmitGTMEvent = useCallback(() => {
    sendSubmitGTMEvent('question', {
      action: 'withdraw',
      category: 'drona',
    });
  }, []);

  const handleWithdraw = useCallback(() => {
    if (question.isUpdatingStatus || question.numVotes > 0) return;
    sendWithdrawSubmitGTMEvent();
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will delete the question and others cannot see it!',
      onOk: () => {
        question.withdraw();
        analytics.click({
          click_type: DRONA_TRACKING_TYPES.dronaQuestionWithdrawQuestion,
        });
      },
      gtmData: {
        eventName: 'question',
        action: 'withdraw',
        category: 'drona',
      },
    });
  }, [question, sendWithdrawSubmitGTMEvent]);

  const handleDelete = useCallback(() => {
    if (question.isUpdatingStatus) return;
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will delete the question and others cannot see it!',
      onOk: () => question.delete(),
    });
  }, [question]);

  const handleVote = useCallback(() => {
    // Disallow upvotes for chat disabled users
    if (meeting.manager.isChatDisabled) {
      toast.show({
        message: 'Question upvoting has been disabled by host for you!',
      });
    } else {
      question.vote();
    }
  }, [meeting, question]);

  function actionUi() {
    if (question.isCompleted) {
      return (
        <div className="row align-c hint h5 no-mgn-b
          m-question__action--success-inverted"
        >
          <VectorIcon name="tick-mark" />
          <span className="m-l-5">Answered LIVE in Class</span>
        </div>
      );
    } else if (meeting.isSuperHost) {
      if (question.status === QuestionStatus.ongoing) {
        return (
          <div className="m-question__actions">
            <div className="m-question__answering">
              <Icon name="chat1" />
              <span className="m-l-5">You're answering now</span>
            </div>
            <Tappable
              className="btn btn-small btn-danger m-question__action"
              onClick={() => question.markAsAnswered()}
            >
              Mark Answered
            </Tappable>
          </div>
        );
      } else if (question.status === QuestionStatus.pending) {
        return (
          <div className="m-question__actions">
            <Tappable
              className="
                btn btn-small btn-outlined m-question__action
                m-question__action--success-outlined
              "
              disabled={question.isUpdatingStatus}
              onClick={() => {
                question.markAsDuplicate();
                analytics.click({
                  click_type: DRONA_TRACKING_TYPES
                    .dronaQuestionMarkAsAnsweredClick,
                });
              }}
            >
              Already Answered
            </Tappable>
            <Tappable
              className="
                btn btn-small m-question__action
                m-question__action--success
              "
              disabled={question.isUpdatingStatus}
              onClick={() => {
                question.answerNow();
                analytics.click({
                  click_type: DRONA_TRACKING_TYPES.dronaQuestionAnswerNowClick,
                });
              }}
            >
              Answer Now
            </Tappable>
          </div>
        );
      } else {
        return null;
      }
    } else if (
      question.asker.isCurrentUser
      && question.status === QuestionStatus.pending
    ) {
      return (
        <div className="m-question__right">
          <Tooltip
            component="a"
            className={classNames(
              'm-question__withdraw',
              { primary: question.numVotes === 0 },
              { 'default-font': question.numVotes !== 0 },
            )}
            isDisabled={question.numVotes === 0}
            onClick={handleWithdraw}
            title="Can't be withdrawn because it has upvotes"
          >
            <span className="m-r-5">
              Withdraw My Question
            </span>
            <Icon name="return" />
          </Tooltip>
        </div>
      );
    } else if (question.status === QuestionStatus.ongoing) {
      return (
        <div className="m-question__actions">
          <div className="m-question__answering">
            <Icon name="chat1" />
            <span className="m-l-5">
              Getting answered LIVE now
            </span>
          </div>
          {
            question.asker.isCurrentUser
            && (
              <Tappable
                className="btn btn-small btn-danger m-question__action"
                onClick={() => question.markAsAnswered()}
              >
                Mark Answered
              </Tappable>
            )
          }
        </div>
      );
    } else {
      return null;
    }
  }

  function deleteActionUi() {
    return (meeting.isSuperHost && meeting.isLive && !question.isCompleted) && (
      <Tappable
        className="btn btn-icon btn-small btn-dark m-question-actions"
        onClick={handleDelete}
      >
        <Icon name="trash" />
      </Tappable>
    );
  }

  function moreActionsUi() {
    return (meeting.isSuperHost && meeting.isLive && !question.isCompleted) && (
      <MeetingParticipantActions
        className="m-question-actions"
        areActionsOpen={areActionsOpen}
        setActionsOpen={setActionsOpen}
        fromId={question.askerId}
        message={question}
      />
    );
  }

  function timeUi() {
    if (message) {
      return (
        <div className="hint h5 no-mgn-b">
          {toHHmm(timestamp)}
        </div>
      );
    } else if (question.isCompleted) {
      return (
        <div className="hint h5 no-mgn-b">
          Answered
          {' '}
          {timeSince(question.answeredAt)}
          {' '}
          ago
        </div>
      );
    } else {
      return (
        <div className="hint h5 no-mgn-b">
          Asked
          {' '}
          {timeSince(question.askedAt)}
          {' '}
          ago
        </div>
      );
    }
  }

  function upvotesUi() {
    if (
      question.asker.isCurrentUser
      || meeting.isSuperHost
      || question.status !== QuestionStatus.pending
    ) {
      return (
        <div className="m-question__upvotes">
          <Icon name="like" />
          <span className="m-l-5">
            {question.numVotes}
          </span>
        </div>
      );
    } else {
      return (
        <div className="m-question__upvotes">
          <Tappable
            gtmEventType="question_upvote"
            gtmEventResult={question.isUpvoted
              ? 'remove_upvote' : 'add_upvote'}
            gtmEventAction="click"
            gtmEventCategory="drona"
            onClick={handleVote}
          >
            <Icon
              className={classNames(
                'm-question__vote',
                { 'm-question__vote--active': question.isUpvoted },
              )}
              name="like"
            />
          </Tappable>
          <span className="m-l-5">
            {question.numVotes}
          </span>
        </div>
      );
    }
  }

  if (question.isBotQuestion) {
    return (
      <QuestionWithBotResponse
        ref={ref}
        question={question}
        parentClassName={className}
        areActionsOpen={areActionsOpen}
        deleteActionUi={deleteActionUi}
        moreActionsUi={moreActionsUi}
        handleWithdraw={handleWithdraw}
        timeUi={timeUi}
        upvotesUi={upvotesUi}
        {...remainingProps}
      />
    );
  } else {
    return (
      <QuestionContent
        ref={ref}
        question={question}
        parentClassName={className}
        areActionsOpen={areActionsOpen}
        deleteActionUi={deleteActionUi}
        moreActionsUi={moreActionsUi}
        actionUi={actionUi}
        timeUi={timeUi}
        upvotesUi={upvotesUi}
        {...remainingProps}
      />
    );
  }
}

Question.propTypes = {
  measureHeight: PropTypes.bool,
  question: PropTypes.object.isRequired,
  message: PropTypes.bool,
  timestamp: PropTypes.number,
};

export default observer(Question);
