/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import {
  action, computed, makeObservable, observable,
} from 'mobx';
import analytics from '~meetings/analytics';
import clamp from 'lodash/clamp';
import findIndex from 'lodash/findIndex';

import { isNullOrUndefined } from '@common/utils/type';
import { MEETING_ACTION_TRACKING } from '~meetings/utils/constants';
import { NotImplementedError } from '@common/errors';
import { toPercentages } from '~meetings/utils/number';
import { transformDistribution } from '~meetings/utils/choices';

const TICK_INTERVAL = 50; // In ms

/* This class should be used as an interface */
class Quiz {
  // Stores the interval id for countdown
  _tick = null;

  _startedAt = null;

  // launch time on the source
  _sourceStartedAt = null;

  _performanceTimerEnabled = false;

  myChoiceIndex = null;

  isStarted = false;

  isEnded = false;

  timeElapsed = 0; // In ms

  timeToSolve = null; // In ms

  constructor(data) {
    this._data = data;

    if (data?.['start_time']) {
      this._sourceStartedAt = new Date(data.start_time).getTime();
    } else {
      this._sourceStartedAt = new Date().getTime();
    }
    if (data?.performanceTimerEnabled) {
      this._performanceTimerEnabled = data.performanceTimerEnabled;
    }
    /**
     * Stored as an array of the following format
     * [x, y, z] where i'th index stores the number of audience who selected
     * i'th option.
     */
    this._choiceDistribution = new Array(this.choices.length).fill(0);
    makeObservable(this, {
      _choiceDistribution: observable,
      _data: observable.ref,
      _handleTick: action.bound,
      choiceDistribution: computed,
      choices: computed,
      correctChoice: computed,
      correctChoiceIndex: computed,
      data: computed,
      description: computed,
      duration: computed,
      handleEnd: action.bound,
      handleSubmission: action.bound,
      isActive: computed,
      isAttempted: computed,
      isCorrect: computed,
      isEnded: observable,
      isStarted: observable,
      myChoice: computed,
      myChoiceIndex: observable,
      problem: computed,
      reset: action.bound,
      resetTimeElapsed: action.bound,
      setChoiceIndex: action.bound,
      setChoiceDistribution: action.bound,
      setChoices: action.bound,
      setTimeToSolve: action.bound,
      start: action.bound,
      timeElapsed: observable,
      timeLeft: computed,
      timeToSolve: observable,
      totalResponses: computed,
      updateTimeElapsed: action.bound,
    });
  }

  destroy() {
    clearInterval(this._tick);
  }

  /* Public methods/getters */

  /**
   * Write you logic about what to do when quiz timer ends
   */
  handleEnd() {
    clearInterval(this._tick);
    this.isEnded = true;
  }

  /**
   * Every class that extends this class should extend should implement
   * this method.
   *
   * Write you logic about what to do when user submits his answer for the
   * quiz problem.
   */
  handleSubmission(choice) {
    throw new NotImplementedError();
  }

  reset() {
    clearInterval(this._tick);
    this.isStarted = false;
    this.isEnded = false;
    this.setChoiceIndex(null);
    this.setTimeToSolve(null);
    this.resetTimeElapsed();
  }

  resetTimeElapsed() {
    this._startedAt = null;
    this.timeElapsed = 0;
  }

  setChoiceIndex(choiceIndex) {
    this.myChoiceIndex = choiceIndex;
    this.setTimeToSolve();
  }

  setChoiceDistribution(distribution) {
    this._choiceDistribution = transformDistribution(
      this.choices.map(o => o.answer),
      distribution,
    );
  }

  setChoices(choices) {
    const { ...problem } = this.problem;
    problem.choices = choices;
    this._data = {
      ...this.data,
      problem,
    };
  }

  setTimeToSolve() {
    this.timeToSolve = this.timeElapsed;
  }

  start(force = false) {
    if (force) {
      this.reset();
    }

    if (this.isStarted) {
      throw Error('Quiz already started');
    }

    // either consider source started at or current time basis
    // performanceTimerEnabled
    this._startedAt = this._performanceTimerEnabled
      ? performance.now() : this._sourceStartedAt;
    this.isStarted = true;
    this._tick = setInterval(this._handleTick, TICK_INTERVAL);

    analytics.view(
      MEETING_ACTION_TRACKING.quizViewedByLearner,
      'Live Meeting', {
        source_started_at: this._sourceStartedAt,
      },
    );

    const viewedAt = new Date().getTime();
    if (Math.abs(viewedAt - this._sourceStartedAt) > 3000) {
      // more than 3 seconds difference between start and view
      analytics.view(
        MEETING_ACTION_TRACKING.quizViewedLateByLearner,
        'Live Meeting', {
          source_started_at: this._sourceStartedAt,
          started_at: viewedAt,
          time_difference:
            (viewedAt - this._sourceStartedAt) / 1000,
        },
      );
    }
  }

  updateTimeElapsed() {
    const now = this._performanceTimerEnabled
      ? performance.now() : new Date().getTime();
    this.timeElapsed = now - this._startedAt;
  }

  get choices() {
    return this.problem.choices;
  }

  /**
   * Returns choice distribution in terms of percentages
   */
  get choiceDistribution() {
    return toPercentages(this._choiceDistribution);
  }

  get correctChoiceIndex() {
    return findIndex(this.choices, o => o.is_correct_answer);
  }

  get correctChoice() {
    return this.choices[this.correctChoiceIndex];
  }

  get data() {
    return this._data;
  }

  get description() {
    return this.problem.description;
  }

  // In ms
  get duration() {
    return this.data.duration * 1000;
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get isActive() {
    return this.isStarted && !this.isEnded;
  }

  get isAttempted() {
    return !isNullOrUndefined(this.myChoiceIndex);
  }

  get isCorrect() {
    return (
      !isNullOrUndefined(this.myChoiceIndex)
      && !isNullOrUndefined(this.correctChoiceIndex)
      && this.myChoiceIndex === this.correctChoiceIndex
    );
  }

  get myChoice() {
    return this.choices[this.myChoiceIndex];
  }

  get problem() {
    return this.data.problem;
  }

  // Returns time left for quiz to end in ms
  get timeLeft() {
    if (this.isEnded) {
      return 0;
    } else if (!this.isStarted) {
      return this.duration;
    } else {
      return clamp(this.duration - (this.timeElapsed || 0), 0, this.duration);
    }
  }

  get totalResponses() {
    return this._choiceDistribution.reduce((a, b) => a + b, 0);
  }

  /* Private */

  _handleTick() {
    this.updateTimeElapsed();

    if (this.timeElapsed >= this.duration) {
      this.handleEnd();
    }
  }
}

export default Quiz;
