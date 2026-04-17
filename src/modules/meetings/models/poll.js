import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import camelCase from 'lodash/camelCase';
import clamp from 'lodash/clamp';

import { toast } from '@common/ui/general/Toast';
import { getURLWithUTMParams } from '@common/utils/url';
import { toPercentages } from '~meetings/utils/number';
import { transformDistribution } from '~meetings/utils/choices';

const TICK_INTERVAL = 500;

const POLL_MIN_EXPIRY_TIME = 10000;

const ActionTypes = {
  end: 'end_poll',
  loadAllResponses: 'fetch_poll_responses',
  submit: 'submit_poll_response',
};

const clientEvents = ['responses', 'poll_result'];

class Poll {
  _tick = null;

  timeElapsed = 0;

  isEnded = false;

  isEndedOnServer = false;

  isStarted = false;

  isSubmitting = false;

  isSubmitted = false;

  submitError = null;

  myChoiceIndices = [];

  participationCount = 0;

  isResultPublishing = false;

  isResultPublished = false;

  resultPublishError = null;

  isMinimized = false;

  constructor(data, manager, publisherId) {
    this._data = data;
    this._manager = manager;
    this._publisherId = publisherId;

    this._distribution = new Array(this.choices.length).fill(0);
    this._addEventListeners();
    makeObservable(this, {
      _data: observable.ref,
      _distribution: observable.ref,
      canClose: computed,
      canSubmit: computed,
      distribution: computed,
      handleEnd: action.bound,
      isActive: computed,
      isResultPublished: observable,
      isResultPublishing: observable,
      isEnded: observable,
      isStarted: observable,
      isSubmitted: observable,
      isSubmitting: observable,
      myChoiceIndices: observable.ref,
      participationCount: observable,
      reset: action.bound,
      resetMyChoice: action.bound,
      resultPublishError: observable.ref,
      submitError: observable.ref,
      setDistribution: action.bound,
      setMyChoice: action.bound,
      setParticipationCount: action.bound,
      start: action.bound,
      timeElapsed: observable,
      totalResponses: computed,
    });
  }

  destroy() {
    clearInterval(this._tick);
    this._removeEventListeners();
  }

  endOnServer() {
    if (this.meeting.isSuperHost && !this.isEndedOnServer) {
      this.socket.send(ActionTypes.end, { poll_id: this.id }, 3);
    }
  }

  handleEnd() {
    clearInterval(this._tick);
    this.isEnded = true;
    this.endOnServer();
  }

  loadAllResponses() {
    this.socket.send(ActionTypes.loadAllResponses, { poll_id: this.id });
  }

  publishResult = flow(function* () {
    if (
      this.isResultPublishing
      || this.isResultPublished
      || !this.isPublisher
    ) {
      return;
    }

    this.isResultPublishing = true;
    this.resultPublishError = null;

    try {
      const payload = this._createResultPayload();
      yield this.messaging.sendEvent('poll-result', payload, true);
      this.isResultPublished = true;
      // Poll results will be shown in chat window
      this.isMinimized = true;
    } catch (error) {
      this.resultPublishError = error;
    }

    this.isResultPublishing = false;
  });

  reset() {
    clearInterval(this._tick);
    this.resetMyChoice();
    this.timeElapsed = 0;
    this.isStarted = false;
  }

  resetMyChoice() {
    this.myChoiceIndices = [];
  }

  setDistribution(distribution) {
    this._distribution = transformDistribution(this.choices, distribution);
  }

  setMyChoice(index) {
    if (this.canChooseMultiple) {
      if (this.myChoiceIndices.includes(index)) {
        this.myChoiceIndices = this.myChoiceIndices.filter(o => o !== index);
      } else {
        this.myChoiceIndices = this.myChoiceIndices.concat([index]);
      }
    } else {
      this.myChoiceIndices = [index];
    }
  }

  setParticipationCount(participationCount) {
    this.participationCount = participationCount;
  }

  submit = flow(function* () {
    if (!this.canSubmit) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      const payload = {
        poll_id: this.id,
        response: this.myChoices,
        page_url: getURLWithUTMParams(),
      };
      yield this.socket.sendAsync(ActionTypes.submit, payload);
      this.isSubmitted = true;
      toast.show({ message: 'Your response has been submitted!' });
    } catch (error) {
      toast.show({
        message: 'Failed to submit response!',
        type: 'error',
      });
      this.submitError = error;
    }

    this.isSubmitting = false;
  });

  updateTimeElapsed() {
    const now = performance.now();
    this.timeElapsed = now - this._startedAt;
  }

  start(force = false) {
    if (force) {
      this.reset();
    }

    if (this.isStarted) {
      throw Error('Poll already started');
    }

    // TODO: Add trackings
    this._startedAt = performance.now();
    this.isStarted = true;
    clearInterval(this._tick);
    this._tick = setInterval(this._handleTick, TICK_INTERVAL);
  }

  get canChooseMultiple() {
    return this.data.type === 'checkbox';
  }

  get canClose() {
    return (
      !this.meeting.isSuperHost
      && this.timeElapsed > POLL_MIN_EXPIRY_TIME
    );
  }

  get canSubmit() {
    return !this.isSubmitting && this.myChoiceIndices.length > 0;
  }

  get choices() {
    return this.data.choices;
  }

  get data() {
    return this._data;
  }

  get description() {
    return this.data.description;
  }

  get distribution() {
    return toPercentages(this._distribution);
  }

  get duration() {
    return this.data.duration * 1000;
  }

  get id() {
    return this.data.id;
  }

  get isActive() {
    return this.isStarted && !this.isEnded;
  }

  get isPublisher() {
    return String(this._publisherId) === this.meeting.userId;
  }

  get manager() {
    return this._manager;
  }

  get meeting() {
    return this.manager.meeting;
  }

  get messaging() {
    return this.meeting.messaging;
  }

  get myChoices() {
    return this.myChoiceIndices.map(index => this.choices[index]);
  }

  get socket() {
    return this.manager.socket;
  }

  // Returns time left for quiz to end in ms
  get timeLeft() {
    if (this.isEnded) {
      return 0;
    } else if (!this.isStarted) {
      return this.duration;
    } else {
      return clamp(
        this.duration - (this.timeElapsed || 0),
        0,
        this.duration,
      );
    }
  }

  get totalResponses() {
    return this._distribution.reduce((a, b) => a + b, 0);
  }

  /* Event handlers */

  // eslint-disable-next-line
  _handlePollResult = (data) => {
    if (this.isEndedOnServer) {
      return;
    }

    this.isEndedOnServer = true;
    if (!this.isEnded) {
      this.handleEnd();
    }

    this.setDistribution(data.distribution);
    this.setParticipationCount(data.participation_count);
    this.publishResult();
  }

  // eslint-disable-next-line
  _handleResponses = (data) => {
    this.setDistribution(data.distribution);
    this.setParticipationCount(data.participation_count);
  }

  /* Private */

  _createResultPayload() {
    return {
      description: this.description,
      choices: this.choices.map((choice, index) => ({
        text: choice,
        distribution: this._distribution[index],
      })),
      participation_count: this.participationCount,
      type: this.data.type,
    };
  }

  _addEventListeners() {
    this._removeEventListeners();
    clientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);

      this.socket.on(
        this._getNamespacedEvent(eventName),
        this[`_${handlerFnName}`],
      );

      this.socket.on(
        this._getNamespacedEvent(eventName),
        this.meeting.trackSocketEvent,
      );
    });
  }

  _getNamespacedEvent(event) {
    return `poll::${this.id}::${event}`;
  }

  _handleTick = () => {
    this.updateTimeElapsed();

    if (this.timeElapsed >= this.duration) {
      this.handleEnd();
    }
  }

  _removeEventListeners() {
    clientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);

      this.socket.off(
        this._getNamespacedEvent(eventName),
        this[`_${handlerFnName}`],
      );

      this.socket.off(
        this._getNamespacedEvent(eventName),
        this.meeting.trackSocketEvent,
      );
    });
  }
}

export default Poll;
