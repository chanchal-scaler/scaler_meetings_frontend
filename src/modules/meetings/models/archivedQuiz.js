import {
  action, flow, makeObservable, observable, computed,
} from 'mobx';

import { logEvent } from '@common/utils/logger';
import { toast } from '@common/ui/general/Toast';
import archiveApi from '~meetings/api/archive';
import Quiz from './quiz';

const ActionTypes = {
  acknowledge: 'quiz_ack',
  end: 'end_quiz',
  fetchResult: 'fetch_quiz_result',
  loadAllResponses: 'fetch_quiz_responses',
  submit: 'submit_quiz_response',
};

const MAX_RETRIES = 3;

class ArchivedQuiz extends Quiz {
  _leaderboardTimeout = null;

  _submissionRetries = 0;

  isLoading = false;

  loadError = null;

  isSubmitted = false;

  isSubmitting = false;

  submitError = null;

  resultShown = false;

  showPopover = false;

  popoverType = null;

  constructor(archive, data) {
    super(data);
    this.archive = archive;
    makeObservable(this, {
      _handleTick: action.bound,
      handleSubmission: action.bound,
      sendSubmission: action.bound,
      isLoading: observable,
      isSubmitting: observable,
      loadError: observable.ref,
      submitError: observable.ref,
      showPopover: observable,
      popoverType: observable,
      setPopover: action.bound,
      activeInLive: computed,
      score: computed,
      sessionStatus: computed,
    });
  }

  start() {
    this._acknowledge();
    super.start();
  }

  destroy() {
    super.destroy();
  }

  handleEnd() {
    super.handleEnd();

    this.getResult();
  }

  handleSubmission(choice) {
    if (this.isAttempted) {
      return;
    }

    this.setChoiceIndex(choice);

    toast.show({ message: 'Your answer has been recorded' });
    this.sendSubmission();

    this.handleEnd();
  }

  getResult = flow(function* () {
    if (!this.isEnded) {
      return;
    }

    const payload = {
      quiz_id: this.id,
    };

    try {
      const json = yield archiveApi.fetchQuizResult(this.slug, payload);
      const { distribution, problems } = json;
      this.setChoices(problems[this.problem.id].choices);
      this.setChoiceDistribution(distribution[this.problem.id]);
    } catch (error) {
      logEvent(
        'error',
        'ArchiveQuizResultError: Failed to Get Quiz Result',
        error,
      );
    }

    this.resultShown = true;
    // const { ranklist: list, num_of_problems: numProblems } = leaderboard;
    // this.manager.setLeaderboard({ list, numProblems });
  });

  loadAllResponses = flow(function* () {
    if (this.isLoading) return;

    this.isLoading = true;
    this.loadError = null;

    try {
      yield this.socket.sendAsync(
        ActionTypes.loadAllResponses,
        { problem_id: this.problem.id, quiz_id: this.id },
      );
    } catch (error) {
      this.loadError = error;
    }

    this.isLoading = false;
  });

  sendSubmission = flow(function* (force = false) {
    if (force) {
      this._submissionRetries = 0;
    }

    if (
      !this.isActive
      || this.isSubmitted
      || this.isSubmitting
      || this._submissionRetries >= MAX_RETRIES
    ) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      const payload = this._createSubmissionPayload();
      const json = yield archiveApi.submitQuiz(this.slug, payload);
      this._data = {
        ...this.data,
        score: json.score,
        session_status: json.session_status,
      };
      this.isSubmitted = true;
      this.isSubmitting = false;
    } catch (error) {
      this.submitError = error;
      this.isSubmitting = false;
      this._retry();
    }
  })

  setPopover(showPopover) {
    this.showPopover = showPopover;
  }

  skip = () => {
    this.setPopover(false);
    const recording = this.archive.playlist[
      this.archive.currentRecordingIndex
    ];

    if (recording) {
      this.archive.setSelectedVideo({
        src: recording.src,
        resumeAt: (
          this.relativeStartTimeCurrentVideo + this.duration
        ) / 1000,
      });
    }
  }

  get sessionStatus() {
    return this.data.session_status;
  }

  get slug() {
    return this.archive.slug;
  }

  get score() {
    return this.data.score;
  }

  get timestamp() {
    return new Date(this.data.start_time).getTime();
  }

  get relativeStartTime() {
    if (this.archive.playlist[0]) {
      return this.timestamp - this.archive.playlist[0].startedAt;
    }
    return 0;
  }

  get relativeStartTimeCurrentVideo() {
    const recording = this.archive.playlist[
      this.archive.currentRecordingIndex
    ];
    if (recording) {
      return this.timestamp - recording.startedAt;
    }
    return 0;
  }

  get activeInLive() {
    const { currentTimestamp } = this.archive;
    return (
      this.timestamp < currentTimestamp
      && this.timestamp + this.duration > currentTimestamp
    );
  }

  /* Event handlers */

  _handleResponses = (data) => {
    this.setChoiceDistribution(data.distribution);
  }

  _handleSubmissionResult = (data) => {
    if (!data.result.success) {
      toast.show({
        message: data.result.message,
        type: 'error',
      });
    }
  }

  // Override method from the parent Quiz class
  _handleTick() {
    super.updateTimeElapsed();
    const hasInfiniteTime = !this.archive?.config?.autoStartArchiveQuiz;

    if (hasInfiniteTime && this.timeElapsed >= this.duration) {
      this.handleEnd();
    }
  }

  /* Private */

  _acknowledge = flow(function* () {
    try {
      yield archiveApi.acknowledgeQuiz(this.slug, this.id);
    } catch (error) {
      logEvent(
        'error',
        'ArchiveQuizError: Failed to Acknowledge Quiz',
        error,
      );
    }
  });

  _createSubmissionPayload() {
    return {
      quiz_id: this.id,
      problem_id: this.problem.id,
      response: [this.myChoice.answer],
      response_time: this.timeToSolve,
    };
  }

  _retry() {
    this._submissionRetries += 1;
    this.sendSubmission();
  }
}

export default ArchivedQuiz;
