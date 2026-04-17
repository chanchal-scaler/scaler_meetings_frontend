import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import camelCase from 'lodash/camelCase';
import clamp from 'lodash/clamp';

import { toast } from '@common/ui/general/Toast';
import DropdownField from './surveyField/dropDownField';
import NormalInputField from './surveyField/normalInputField';

const TICK_INTERVAL = 500;

const ActionTypes = {
  end: 'end_survey',
  submit: 'submit_survey_response',
};

const clientEvents = ['survey_result'];

class Survey {
  _tick = null;

  timeElapsed = 0;

  isEnded = false;

  isEndedOnServer = false;

  isStarted = false;

  isSubmitting = false;

  currentFieldIndex = 0;

  isSubmitted = false;

  submitError = null;

  isSurveyLive = false;

  closeSurvey = false;

  isResultPublishing = false;

  isResultPublished = false;

  resultPublishError = null;

  surveyField = null

  formResponse = null;

  constructor(data, manager, publisherId) {
    this._data = data;
    this._manager = manager;
    this._publisherId = publisherId;
    this._addEventListeners();
    makeObservable(this, {
      _data: observable.ref,
      canSubmit: action.bound,
      canClose: computed,
      handleEnd: action.bound,
      isActive: computed,
      isResultPublished: observable,
      isResultPublishing: observable,
      isEnded: observable,
      isStarted: observable,
      isSubmitted: observable,
      isSubmitting: observable,
      reset: action.bound,
      resultPublishError: observable.ref,
      submitError: observable.ref,
      initializeField: action.bound,
      start: action.bound,
      timeElapsed: observable,
      currentFieldIndex: observable,
      surveyField: observable,
      formResponse: observable,
    });
  }

  destroy() {
    clearInterval(this._tick);
    this._removeEventListeners();
  }

  endOnServer() {
    if (this.meeting.isSuperHost && !this.isEndedOnServer) {
      this.socket.send(ActionTypes.end, { survey_id: this.id }, 3);
    }
  }

  handleEnd() {
    clearInterval(this._tick);
    this.isEnded = true;
    this.endOnServer();
  }


  reset() {
    clearInterval(this._tick);
    this.timeElapsed = 0;
    this.isStarted = false;
  }

  initializeField(currentSurveyField) {
    if (
      this.surveyField
      && this.surveyField?.fieldData?.id === currentSurveyField.id
    ) {
      return this.surveyField;
    }
    if (currentSurveyField.type === 'dropdown') {
      this.surveyField = new DropdownField(currentSurveyField);
    } else {
      this.surveyField = new NormalInputField(currentSurveyField);
    }
    return this.surveyField;
  }

  submit = flow(function* () {
    if (!this.canSubmit()) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    const payload = {
      form_group_id: this.id,
      id: this.surveyField.formId,
      response: this.surveyField.formResponse,
    };

    try {
      yield this.socket.sendAsync(ActionTypes.submit, payload);
      toast.show({ message: 'Your response has been submitted!' });
      if (this.currentFieldIndex + 1 < this.data?.forms?.length) {
        this.currentFieldIndex += 1;
        this.surveyField.reset();
      } else {
        this.isSubmitted = true;
        this.currentFieldIndex = 0;
        setTimeout(() => {
          this.handleEnd();
        }, 1500);
      }
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
      throw Error('Survey already started');
    }

    this._startedAt = performance.now();
    this.isStarted = true;
    clearInterval(this._tick);
    this._tick = setInterval(this._handleTick, TICK_INTERVAL);
  }

  get canClose() {
    return this.closeSurvey;
  }

  canSubmit() {
    return !!this.surveyField.formResponse && !this.isSubmitting;
  }

  get data() {
    return this._data;
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

  get description() {
    return this.data.description;
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
  /* Event handlers */

  // eslint-disable-next-line
  _handleSurveyResult = (data) => {
    if (this.isEndedOnServer) {
      return;
    }

    this.isEndedOnServer = true;
    if (!this.isEnded) {
      this.isSurveyLive = false;
      this.handleEnd();
    }
  }

  _addEventListeners() {
    this._removeEventListeners();
    clientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);

      this.socket.on(
        this._getNamespacedEvent(eventName),
        this[`_${handlerFnName}`],
      );
    });
  }

  _getNamespacedEvent(event) {
    return `survey::${this.id}::${event}`;
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
    });
  }
}

export default Survey;
