import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { VIEW_TYPES } from '@vectord/analytics';

import {
  botResponseFeedbackTypes, QuestionStatus,
} from '~meetings/utils/question';
import {
  CircularLoader, Icon, Tappable, Tooltip, VectorIcon,
} from '@common/ui/general';
import { DISABLE_HTML_REMARKABLE_OPTIONS } from '@common/utils/remarkable';
import {
  DRONA_FEATURES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { forwardRef } from '@common/ui/hoc';
import { MdRenderer } from '@common/ui/markdown';
import { observer } from 'mobx-react';
import { toast } from '@common/ui/general/Toast';
import { toHHmm } from '@common/utils/date';
import AiAnsweringImg from '~meetings/images/ai_avatars/ai_answering.webp';
import analytics from '@common/utils/analytics';
import ApprovedImg from '~meetings/images/ai_avatars/ai_answer_approved.webp';
import compose from 'lodash/fp/compose';

function QuestionWithBotResponse({
  forwardedRef,
  question,
  parentClassName,
  showAudienceActions = false,
  areActionsOpen = false,
  deleteActionUi,
  moreActionsUi,
  handleWithdraw,
  timeUi,
  upvotesUi,
  ...remainingProps
}) {
  const [statusText, setStatusText] = useState(null);

  const { isSuperHost } = question.meeting;

  const {
    isAnswerStreaming,
    botResponse,
    isApprovedAnswer,
    botResponseFeedback,
    botResponseFeedbackByLearner,
    isSubmittingResponseFeedback: isSubmittingFeedback,
    isMine,
  } = question;

  // botResponse always start with "answer: "
  // so we need to remove it
  let parsedResponse = botResponse;
  if (parsedResponse?.startsWith('answer: ')) {
    parsedResponse = parsedResponse.substring('answer: '.length);
  }

  useEffect(() => {
    if (isAnswerStreaming) {
      setStatusText("Instructor's Sidekick is answering the question...");
    } else if (isSubmittingFeedback) {
      if (isMine) {
        if (botResponseFeedback === botResponseFeedbackTypes.accept) {
          setStatusText('Sending this to Instructor for approval...');
        } else {
          setStatusText('Sending this to Instructor, he will answer soon...');
        }
      } else if (isSuperHost) {
        if (botResponseFeedback === botResponseFeedbackTypes.accept) {
          setStatusText('Moving this to answered tab...');
        } else {
          setStatusText('Please answer the question live...');
        }
      }
    } else {
      setStatusText(null);
    }
  }, [botResponseFeedback, isAnswerStreaming,
    isMine, isSubmittingFeedback, isSuperHost,
  ]);

  useEffect(() => {
    // If not reponded with accept/reject
    // auto accept
    if (showAudienceActions) {
      question.handleAutoAckOnTimeOut();
    }
  }, [question, showAudienceActions]);

  useEffect(() => {
    if (!isAnswerStreaming && showAudienceActions && botResponse) {
      // answer generated
      analytics.view({
        view_name: DRONA_TRACKING_TYPES.dronaAutoResponseAnswerGenerated,
        view_type: VIEW_TYPES.card,
        view_feature: DRONA_FEATURES.botResponse,
      });
    }
  }, [botResponse, isAnswerStreaming, showAudienceActions]);

  useEffect(() => {
    if (
      showAudienceActions
      && !isAnswerStreaming
      && !botResponse
    ) {
      // auto reject when no response present
      question.rejectResponse();
      toast.show({
        message: 'AI did not have the answer, '
          + 'Instructor will answer this question live...',
        type: 'error',
      });
    }
  }, [botResponse, isAnswerStreaming, question, showAudienceActions]);

  const audienceAckUi = () => {
    if (
      showAudienceActions
      && !isAnswerStreaming
      && !isSubmittingFeedback
    ) {
      return (
        <div className="m-question-with-ai__options">
          <div className="m-question-with-ai__separator--line" />
          <div className="m-question-with-ai__options--head">
            Does this answer your question ?
          </div>
          <div className="m-question-with-ai__options--list">
            <Tappable
              className="m-question-with-ai__options--option"
              onClick={() => {
                analytics.click({
                  click_type: DRONA_TRACKING_TYPES
                    .dronaAutoResponseAnswerApprovedByLearner,
                  click_feature: DRONA_FEATURES.botResponse,
                });
                question.acceptResponse();
              }}
              disabled={isSubmittingFeedback}
            >
              <span>Yes</span>
              <span role="img" aria-label="thumbs-up">👍</span>
            </Tappable>
            <Tappable
              className="m-question-with-ai__options--option"
              onClick={() => {
                analytics.click({
                  click_type: DRONA_TRACKING_TYPES
                    .dronaAutoResponseAnswerDisapprovedByLearner,
                  click_feature: DRONA_FEATURES.botResponse,
                });
                question.rejectResponse();
              }}
              disabled={isSubmittingFeedback}
            >
              <span>No</span>
              <span role="img" aria-label="thumbs-down">👎</span>
            </Tappable>
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  const hostAckUi = () => {
    if (botResponse?.length && !isSubmittingFeedback) {
      return (
        <div className="m-question-with-ai__options">
          <div className="m-question-with-ai__separator--line" />
          <div className="m-question-with-ai__options--list">
            <Tappable
              className="m-question-with-ai__options--option"
              onClick={() => {
                analytics.click({
                  click_type: DRONA_TRACKING_TYPES
                    .dronaAutoResponseAnswerApprovedByInstructor,
                  click_feature: DRONA_FEATURES.botResponse,
                });
                question.acceptResponse();
              }}
              disabled={isSubmittingFeedback}
            >
              <span>Approve</span>
              <span role="img" aria-label="green-check-mark">✅</span>
            </Tappable>
            <Tappable
              className="m-question-with-ai__options--option"
              onClick={() => {
                analytics.click({
                  click_type: DRONA_TRACKING_TYPES
                    .dronaAutoResponseAnswerDisapprovedByInstructor,
                  click_feature: DRONA_FEATURES.botResponse,
                });
                question.rejectResponse();
              }}
              disabled={isSubmittingFeedback}
            >
              <span>Reject</span>
              <span role="img" aria-label="x">❌</span>
            </Tappable>
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  const transitionStatusUi = () => {
    if (statusText) {
      return (
        <div className="m-question-with-ai__answering">
          <CircularLoader className="m-question-with-ai__answering--loader" />
          <div className="m-question-bot-status__text">
            {statusText}
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  const actionsUi = () => {
    if (
      question.isMine
      && question.status === QuestionStatus.pending
      && handleWithdraw
    ) {
      return (
        <>
          <div className="m-question-with-ai__separator--line" />
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
        </>
      );
    } else {
      return null;
    }
  };

  const AnswerStatusUi = () => {
    let hostText;
    if (isSuperHost) {
      if (botResponseFeedbackByLearner === botResponseFeedbackTypes.accept) {
        hostText = 'Accepted By Learner';
      } else if (botResponseFeedbackByLearner === botResponseFeedbackTypes
        .reject
      ) {
        hostText = 'Rejected By Learner';
      }
    }

    return (
      <div className="m-question-with-ai__answerinfo--main">
        <span className="m-question-with-ai__answerinfo--text">
          Answer
        </span>
        <span
          className="m-question-with-ai__answerinfo--textby"
        >
          {isApprovedAnswer ? (
            <>
              <VectorIcon name="tick-mark" />
              Approved by Instructor
            </>
          ) : (
            <>
              by Instructor's Sidekick
              {hostText && ` (${hostText})`}
            </>
          )}
        </span>
      </div>
    );
  };

  return (
    <div
      className={classNames(
        'm-question',
        'm-question-with-ai',
        { [parentClassName]: parentClassName },
      )}
      ref={forwardedRef}
      {...remainingProps}
    >
      <div className="m-question-with-ai__container">
        <div className="m-question-with-ai__title">
          <span className="m-question-with-ai__title--text">
            {question.isMine ? 'Your Question' : question.userName}
          </span>
          <div className={classNames(
            'm-question__card',
            'm-question-with-ai__card',
            { 'm-question__card--active': areActionsOpen },
          )}
          >
            {deleteActionUi && deleteActionUi()}
            {moreActionsUi && moreActionsUi()}
            <span className="m-question-with-ai__title--timer">
              {toHHmm(question.askedAt)}
            </span>
          </div>
        </div>
        <div className="m-question-with-ai__question">
          <MdRenderer
            options={DISABLE_HTML_REMARKABLE_OPTIONS}
            mdString={question.body}
          />
        </div>
        {parsedResponse && (
          <>
            <div className="m-question-with-ai__separator">
              <div className="m-question-with-ai__separator--line" />
              <img
                src={isApprovedAnswer ? ApprovedImg : AiAnsweringImg}
                alt={isApprovedAnswer ? 'Approved Answer' : 'Ai Answer'}
                className="m-question-with-ai__separator--img"
              />
            </div>
            <div className="m-question-with-ai__answerinfo">
              <AnswerStatusUi />
              {question?.answeredAt && (
                <div className="m-question-with-ai__answerinfo--answertime">
                  {toHHmm(question.answeredAt)}
                </div>
              )}
            </div>
            <div className="m-question-with-ai__answer">
              <MdRenderer
                options={DISABLE_HTML_REMARKABLE_OPTIONS}
                mdString={parsedResponse}
              />
            </div>
          </>
        )}
        {transitionStatusUi()}
        {!isApprovedAnswer && (
          <>{isSuperHost ? hostAckUi() : audienceAckUi()}</>
        )}
        {actionsUi()}
      </div>
      <div className="m-question__footer">
        {timeUi && timeUi()}
        {upvotesUi && upvotesUi()}
      </div>
    </div>
  );
}

const hoc = compose(
  forwardRef,
  observer,
);

export default hoc(QuestionWithBotResponse);
