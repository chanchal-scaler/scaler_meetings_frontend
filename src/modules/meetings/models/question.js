import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import camelCase from 'lodash/camelCase';
import remove from 'lodash/remove';

import {
  botResponseFeedbackTypes, finalQuestionStatuses,
  QuestionResponderType, QuestionStatus,
} from '~meetings/utils/question';
import { isNegativeContent } from '~meetings/utils/meeting';
import { ONE_MINUTE, ONE_SECOND } from '@common/utils/date';
import { pushUnique } from '@common/utils/array';
import { sendSubmitGTMEvent } from '@common/utils/gtm';
import { toast } from '@common/ui/general/Toast';
import { UserAuthenticationError } from '~meetings/errors';
import EventEmitter from '@common/lib/eventEmitter';
import questionsApi from '~meetings/api/questions';

const events = [
  'vote', 'status_change', 'bot_response_ack_by_asker',
  'bot_response_approved_by_host',
  'bot_response_rejected_by_host',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const ACK_WAIT = ONE_SECOND;

class Question extends EventEmitter {
  _data = {};

  isUpvoting = false;

  isUpdatingStatus = false;

  height = null;

  isSubmittingResponseFeedback = false;

  botResponseFeedback = null;

  botResponseFeedbackByLearner = null;

  feedbackType = null;

  constructor(id, meeting, data) {
    super();

    this._id = id;
    this._meeting = meeting;
    this.setData(data);
    this._addEventListeners();
    this._isNegative = this._hasNegativeContent();
    makeObservable(this, {
      _data: observable,
      addUpvote: action,
      answeredAt: computed,
      asker: computed,
      botResponseFeedback: observable,
      botResponseFeedbackByLearner: observable,
      feedbackType: observable,
      height: observable,
      isCompleted: computed,
      isDeleted: computed,
      isOngoing: computed,
      isApprovedAnswer: computed,
      isUserInteractionWithResponsePending: computed,
      isAnswerStreaming: computed,
      isUpdatingStatus: observable,
      isSubmittingResponseFeedback: observable,
      isBotQuestion: computed,
      isUpvoted: computed,
      isUpvoting: observable,
      numVotes: computed,
      removeUpvote: action,
      setData: action,
      setHeight: action,
      setStatus: action,
      status: computed,
      shouldHide: computed,
    });
  }

  addUpvote(userId) {
    // -2 is used to indicate proxy upvote which can be multiple
    if (userId < 0) {
      this._data.upvoters.push(String(userId));
    } else {
      pushUnique(this._data.upvoters, String(userId));
    }
  }

  answerNow = flow(function* () {
    if (this.isUpdatingStatus) return;

    this.isUpdatingStatus = true;
    try {
      yield questionsApi.answer(this.meeting.slug, this.id);
      this.setStatus(QuestionStatus.ongoing);
      this._sendEvent('question-status-change', {
        status: QuestionStatus.ongoing,
      });
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to update question',
          type: 'error',
        });
      }
    }
    this.isUpdatingStatus = false;
  });

  markAsAnswered() {
    this.setStatus(QuestionStatus.responded);
    this._sendEvent('question-status-change', {
      status: QuestionStatus.responded,
    });
  }

  markAsDuplicate = flow(function* () {
    if (this.isUpdatingStatus) return;

    this.isUpdatingStatus = true;
    try {
      yield questionsApi.dismiss(this.meeting.slug, this.id);
      this.setStatus(QuestionStatus.archived);
      this._sendEvent('question-status-change', {
        status: QuestionStatus.archived,
      });
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        toast.show({
          message: 'Failed to update question',
          type: 'error',
        });
      }
    }
    this.isUpdatingStatus = false;
  });

  removeUpvote(userId) {
    remove(this._data.upvoters, o => o === String(userId));
  }

  setData(data) {
    const newData = { ...data };
    if (data.upvoters) {
      newData.upvoters = newData.upvoters.map(o => String(o));
    }
    this._data = {
      ...this._data,
      ...newData,
    };
  }

  setHeight(height) {
    this.height = height;
  }

  setStatus(status) {
    if (status !== this.status) {
      this._data.status = status;
      this._data.updated_at = new Date();
    }
  }

  syncProxyUpvotes(proxyUserId, votes) {
    const voters = this._data.upvoters;
    const voteCount = voters.filter((id) => id === String(proxyUserId)).length;
    const delta = votes - voteCount;

    if (delta > 0) {
      for (let i = 0; i < delta; i += 1) {
        this.addUpvote(proxyUserId);
      }
    }
  }

  vote = flow(function* () {
    if (this.isUpvoting) return;

    this.isUpvoting = true;
    const isUpvote = !this.isUpvoted;
    let flag;
    // Upvote as soon as button is clicked and revert later if it fails for
    // better UX
    if (isUpvote) {
      this.addUpvote(this.meeting.userId);
      flag = 1;
    } else {
      this.removeUpvote(this.meeting.userId);
      flag = 0;
    }

    try {
      yield questionsApi.vote(this.meeting.slug, this.id, isUpvote);
      this._sendEvent('question-vote', {
        vote_flag: flag,
        user_id: this.meeting.userId,
      });
    } catch (error) {
      // Revert the change because it was not applied on server
      if (isUpvote) {
        this.removeUpvote(this.meeting.userId);
      } else {
        this.addUpvote(this.meeting.userId);
      }
      toast.show({
        message: 'Failed to vote. Try again!',
        type: 'error',
      });
    }
    this.isUpvoting = false;
  });

  boostUpvotes = flow(function* () {
    try {
      yield questionsApi.boostUpvotes(this.meeting.slug, this.id);
      toast.show({
        message: 'Upvotes are being boosted!',
        type: 'success',
      });
    } catch (error) {
      toast.show({
        message: 'Failed to boost upvotes!',
        type: 'error',
      });
    }
  });

  withdrawSubmitGTMEvent = (status, message = 'success') => {
    sendSubmitGTMEvent('question', {
      isStatus: true,
      action: 'withdraw',
      status,
      message,
      category: 'drona',
    });
  }

  withdraw = flow(function* () {
    if (this.isUpdatingStatus || this.numVotes > 0) return;

    this.isUpdatingStatus = true;
    try {
      yield questionsApi.withdraw(this.meeting.slug, this.id);
      this.setStatus(QuestionStatus.deleted);
      this._sendEvent('question-status-change', {
        status: QuestionStatus.deleted,
      });
      toast.show({
        message: 'Question has been withdrawn',
        type: 'info',
      });
      this.withdrawSubmitGTMEvent(true);
    } catch (error) {
      const message = 'Failed to withdraw question';
      this.withdrawSubmitGTMEvent(false, message);
      toast.show({
        message,
        type: 'error',
      });
    }
    this.isUpdatingStatus = false;
  });

  acceptResponse = flow(function* () {
    if (
      this.isSubmittingResponseFeedback
      || this.botResponseFeedback
    ) return;

    this.isSubmittingResponseFeedback = true;
    this.setBotResponseFeedback(botResponseFeedbackTypes.accept);

    try {
      yield questionsApi.acceptResponse(this.meeting.slug, this.id);
      if (this.meeting.isSuperHost) {
        yield sleep(ACK_WAIT);
        this.setStatus(QuestionStatus.answerApproved);
        this.setResponderType(QuestionResponderType.bot);
      } else {
        yield sleep(ACK_WAIT);
        this.setStatus(QuestionStatus.pending);
        this.setBotResponse(this.botResponse || 'answer: 0');
      }
    } catch (error) {
      toast.show({
        message: 'Failed to submit response. Try again!',
        type: 'error',
      });
    }

    this.isSubmittingResponseFeedback = false;
  });

  rejectResponse = flow(function* () {
    if (
      this.isSubmittingResponseFeedback
      || this.botResponseFeedback
    ) return;

    this.isSubmittingResponseFeedback = true;
    this.setBotResponseFeedback(botResponseFeedbackTypes.reject);

    try {
      yield questionsApi.rejectResponse(this.meeting.slug, this.id);
      yield sleep(ACK_WAIT);
      this.setStatus(QuestionStatus.pending);
      this.setResponderType(QuestionResponderType.manual);
    } catch (error) {
      toast.show({
        message: 'Failed to submit response. Try again!',
        type: 'error',
      });
    }

    this.isSubmittingResponseFeedback = false;
  });

  delete = flow(function* () {
    if (this.isUpdatingStatus) return;

    this.isUpdatingStatus = true;
    try {
      yield questionsApi.delete(this.meeting.slug, this.id);
      this.setStatus(QuestionStatus.deleted);
      this._sendEvent('question-status-change', {
        status: QuestionStatus.deleted,
      });
      toast.show({
        message: 'Question has been deleted',
        type: 'info',
      });
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        const message = 'Failed to delete question';
        toast.show({
          message,
          type: 'error',
        });
      }
    }
    this.isUpdatingStatus = false;
  });

  setResponderType(responderType = QuestionResponderType.manual) {
    if (responderType !== this.responderType) {
      this._data.responder_type = responderType;
      this._data.updated_at = new Date();
    }
  }

  setBotResponse(response) {
    this._data.response = response;
  }

  setBotResponseFeedback(feedback) {
    this.botResponseFeedback = feedback;
  }

  handleAutoAckOnTimeOut = () => {
    clearTimeout(this._autoAckTimeout);
    if (this.isUserInteractionWithResponsePending) {
      this._autoAckTimeout = setTimeout(() => {
        if (this.responderType === QuestionResponderType.bot) {
          if (this.botResponse) {
            this.acceptResponse();
          } else {
            this.rejectResponse();
          }
        }
      }, ONE_MINUTE / 2);
    }
  };

  get answeredAt() {
    if (
      [
        QuestionStatus.responded,
        QuestionStatus.archived,
        QuestionStatus.answerApproved,
      ].includes(this.status)
    ) {
      return new Date(this._data.updated_at).getTime();
    } else {
      return null;
    }
  }

  get asker() {
    return this.meeting.getParticipant(this.askerId);
  }

  get askedAt() {
    return new Date(this._data.created_at).getTime();
  }

  get askerId() {
    return String(this._data.asker_id);
  }

  get body() {
    if (this.isProxyQuestion) {
      return this.proxyQuestionContent;
    }
    return this._data.body;
  }

  get userName() {
    if (this.isProxyQuestion) {
      return this.proxyUserName;
    }
    return this.asker.name;
  }

  get proxyUserName() {
    // split body based on delimiter :::
    const nameAndBody = this._data.body.split(':::');
    return nameAndBody[0];
  }

  get proxyQuestionContent() {
    // split body based on delimiter :::
    const nameAndBody = this._data.body.split(':::');
    return nameAndBody[1];
  }

  get isProxyQuestion() {
    return Boolean(this._data.title === 'proxy-question');
  }

  get id() {
    return this._id;
  }

  get isCompleted() {
    return finalQuestionStatuses.includes(this.status);
  }

  get isMine() {
    if (this.isProxyQuestion) {
      return false;
    }
    return this.askerId === this.meeting.userId;
  }

  get isUpvoted() {
    return this._data.upvoters.includes(this.meeting.userId);
  }

  get isApprovedAnswer() {
    return this._data.status === QuestionStatus.answerApproved;
  }

  get meeting() {
    return this._meeting;
  }

  get messaging() {
    return this.meeting.messaging;
  }

  get isUserInteractionWithResponsePending() {
    if (
      !this.isMine
      || this._data.responder_type === QuestionResponderType.manual
      || this._data.response
    ) {
      return false;
    }

    return (this.feedbackType === null);
  }

  get isAnswerStreaming() {
    return this.isUserInteractionWithResponsePending
      && this.meeting?.chatBotStream?.isStreaming;
  }

  get botResponse() {
    let botResponse;
    if (this.isUserInteractionWithResponsePending
      && this.meeting?.chatBotStream?.chatStreamMessage
    ) {
      botResponse = this.meeting?.chatBotStream?.chatStreamMessage;
    }
    if (this._data.response) {
      botResponse = this._data.response;
    }

    if (botResponse === 'answer: 0') {
      return null;
    }

    if (this.meeting.isSuperHost) return botResponse;

    if (this.responderType === QuestionResponderType.bot) {
      if (this.isApprovedAnswer || this.isMine) {
        return botResponse;
      }
    }

    return null;
  }

  get isBotQuestion() {
    if (
      this.responderType === QuestionResponderType.bot
      && this.meeting.isAutoResponsesEnabled
      && this.botResponse
    ) {
      return true;
    }

    return false;
  }

  get responderType() {
    return this._data.responder_type || QuestionResponderType.manual;
  }

  get numVotes() {
    return this._data.upvoters.length;
  }

  get status() {
    return this._data.status;
  }

  get isDeleted() {
    return this.status === QuestionStatus.deleted;
  }

  get isOngoing() {
    return this.status === QuestionStatus.ongoing;
  }

  get shouldHide() {
    if (this.isMine) return false;

    return (
      this.meeting.shouldHideNegativeContent
      && this._isNegative
    );
  }

  /* Event handlers */

  _handleVote = (data) => {
    if (data.vote_flag === 1) {
      this.addUpvote(data.user_id);
    } else {
      this.removeUpvote(data.user_id);
    }
  }

  _handleStatusChange = (data) => {
    if (data.status === QuestionStatus.ongoing) {
      this.meeting.activeQuestions.forEach(question => {
        if (question.status === QuestionStatus.ongoing) {
          question.setStatus(QuestionStatus.responded);
        }
      });
    }

    this.setStatus(data.status);
    if (data.status === QuestionStatus.ongoing) {
      this.setResponderType(QuestionResponderType.manual);
    }
  }

  _handleBotResponseAckByAsker = (data) => {
    if (data.question.response) {
      this.setBotResponse(data.question.response);
      if (data.question.action === 'accept') {
        this.botResponseFeedbackByLearner = botResponseFeedbackTypes.accept;
      } else if (data.question.action === 'reject') {
        this.botResponseFeedbackByLearner = botResponseFeedbackTypes.reject;
      }
    }
  }

  _handleBotResponseApprovedByHost = (data) => {
    this.setStatus(QuestionStatus.answerApproved);
    this.setResponderType(QuestionResponderType.bot);
    this.setBotResponse(data.question.response);
    if (this.isMine) {
      toast.show({
        message: 'Sidekick generated response for your question '
          + 'has been approved by instructor.',
        type: 'info',
      });
    }
  }

  _handleBotResponseRejectedByHost = () => {
    this.setStatus(QuestionStatus.pending);
    this.setResponderType(QuestionResponderType.manual);
  }

  /* Private */

  _hasNegativeContent() {
    return isNegativeContent(this._data.body);
  }

  _addEventListeners() {
    if (this.isCompleted) return;

    this._removeEventListeners();
    events.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _removeEventListeners() {
    events.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this.off(eventName, this[`_${handlerFnName}`]);
    });
  }

  _sendEvent(eventName, data) {
    this.messaging.sendEvent(eventName, {
      ...data,
      question_id: this.id,
    });
  }
}

export default Question;
