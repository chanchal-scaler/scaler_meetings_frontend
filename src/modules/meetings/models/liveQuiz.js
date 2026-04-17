import {
  action, flow, makeObservable, observable,
} from 'mobx';
import camelCase from 'lodash/camelCase';

import { MEETING_ACTION_TRACKING } from '~meetings/utils/constants';
import { randomInt } from '@common/utils/random';
import { toast } from '@common/ui/general/Toast';
import Quiz from './quiz';

const ActionTypes = {
  acknowledge: 'quiz_ack',
  end: 'end_quiz',
  fetchResult: 'fetch_quiz_result',
  loadAllResponses: 'fetch_quiz_responses',
  submit: 'submit_quiz_response',
};

const clientEvents = [
  'submission_result', 'responses', 'quiz_result', 'answers',
];

const MAX_RETRIES = 3;

// Notify server after 1 second of quiz end on the client to end the quiz
// if not yet done
const QUIZ_END_OFFSET = 1000; // In ms

class LiveQuiz extends Quiz {
  _leaderboardTimeout = null;

  _submissionRetries = 0;

  isLoading = false;

  loadError = null;

  isSubmitted = false;

  isSubmitting = false;

  submitError = null;

  isEndedOnServer = false;

  constructor(data, manager, isDummy = false) {
    super(data);

    this._manager = manager;
    this.isDummy = isDummy;
    this._acknowledge();
    this._addEventListeners();
    makeObservable(this, {
      handleSubmission: action.bound,
      isLoading: observable,
      isSubmitting: observable,
      loadError: observable.ref,
      submitError: observable.ref,
    });
  }

  destroy() {
    super.destroy();
    this._removeEventListeners();
  }

  handleSubmission(choice) {
    if (this.isAttempted) {
      return;
    }

    this.setChoiceIndex(choice);
    this.sendSubmission();
    this.meeting.trackEvent(
      MEETING_ACTION_TRACKING.quizAnswerSelected,
      {
        userChoice: choice,
        quizId: this.id,
      },
    );
    toast.show({ message: 'Your answer has been recorded' });
  }

  handleEnd() {
    super.handleEnd();

    this._enqueueEndQuiz();
  }

  endOnServer() {
    if (this.isDummy || this.isEndedOnServer) {
      return;
    }

    this.socket.send(ActionTypes.end, { quiz_id: this.id }, 3);
  }

  // This method is called by audience if they some how miss the result
  // broadcasted by super host to get the quiz results
  getResult() {
    if (this.isEndedOnServer) {
      return;
    }

    // Try for 3 times
    this.socket.send(ActionTypes.fetchResult, { quiz_id: this.id }, 3);
    this.meeting.track('getResult');
  }

  loadAllResponses = flow(function* () {
    if (this.isLoading || this.isDummy) return;

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
      this.isDummy
      || !this.isActive
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
      yield this.socket.sendAsync(ActionTypes.submit, payload);
      this.isSubmitted = true;
      this.isSubmitting = false;
      this.meeting.trackEvent(
        MEETING_ACTION_TRACKING.quizSubmissionToBackend,
        {
          quizId: this.id,
          retries: this._submissionRetries,
        },
      );
    } catch (error) {
      this.submitError = error;
      this.isSubmitting = false;
      this.meeting.trackEvent(
        MEETING_ACTION_TRACKING.quizSendToBackendFailed,
        {
          quizId: this.id,
          retries: this._submissionRetries,
          error: this.submitError,
        },
      );
      this._retry();
    }
  })

  get manager() {
    return this._manager;
  }

  get meeting() {
    return this.manager.meeting;
  }

  get socket() {
    return this.manager.socket;
  }

  /* Event handlers */

  _handleAnswers = (data) => {
    this.setChoices(data.problems[this.problem.id].choices);
  }

  _handleResponses = (data) => {
    this.setChoiceDistribution(data.distribution);
  }

  _handleQuizResult = (data) => {
    const {
      distribution, leaderboard, problems, rank_holders: rankHolders,
    } = data;
    this.isEndedOnServer = true;
    this.setChoices(problems[this.problem.id].choices);
    this.setChoiceDistribution(distribution[this.problem.id]);

    this.meeting.updateParticipants(rankHolders);
    const { ranklist: list, num_of_problems: numProblems } = leaderboard;
    this.manager.setLeaderboard({ list, numProblems });

    if (!this.isEnded) {
      this.handleEnd();

      if (!this.meeting.isSuperHost) {
        toast.show({
          message: 'Host has ended the quiz!',
          type: 'warning',
        });
      }
    }
  }

  _handleSubmissionResult = (data) => {
    if (!data.result.success) {
      toast.show({
        message: data.result.message,
        type: 'error',
      });
    } else {
      this.manager.myLeaderboardEntry = {
        ...this.manager.myLeaderboardEntry,
        rank: Infinity,
        score: data.result.score,
        solved: data.result.solved,
      };
    }
  }

  /* Private */

  _acknowledge() {
    if (this.isDummy) {
      return;
    }

    // Try 5 times if couldn't send then don't try anymore
    this.socket.send(ActionTypes.acknowledge, { quiz_id: this.id }, 5);
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

  _createSubmissionPayload() {
    return {
      quiz_id: this.id,
      problem_id: this.problem.id,
      response: [this.myChoice.answer],
      response_time: this.timeToSolve,
    };
  }

  _enqueueEndQuiz() {
    if (this.isEndedOnServer) {
      return;
    }

    if (this.isDummy) {
      this._setRandomChoiceDistribution();
      return;
    }

    if (this.meeting.isSuperHost) {
      this._endTimeout = setTimeout(() => {
        this.endOnServer();
      }, QUIZ_END_OFFSET);
    } else {
      // Try to manually fetch result if audience does not receive it in
      // 3 seconds after quiz is ended
      this._endTimeout = setTimeout(() => {
        this.getResult();
      }, QUIZ_END_OFFSET + 3000);
    }
  }

  _getNamespacedEvent(event) {
    return `quiz::${this.id}::${event}`;
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

  _retry() {
    this._submissionRetries += 1;
    this.sendSubmission();
  }

  _setRandomChoiceDistribution() {
    const distribution = {};
    this.choices.forEach(choice => {
      distribution[choice.answer] = randomInt(2, 20);
    });

    this.setChoiceDistribution(distribution);
  }
}

export default LiveQuiz;
