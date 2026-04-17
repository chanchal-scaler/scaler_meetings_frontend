import {
  action, computed, makeObservable, observable, toJS, runInAction,
} from 'mobx';

import { isNullOrUndefined } from '@common/utils/type';
import { pushUnique } from '@common/utils/array';
import {
  REACTION_LIST, ReactionTypes, MAX_USER_LIMIT,
} from '~meetings/utils/reactions';
import ReactionsMessage from './reactionsMessage';

// Aggreate reactions when after 20s from starting
const startTimeout = 20000;

// Aggregate reactions if no new reaction is added in last 5s
const updateTimeout = 5000;

class LiveReactions {
  _responses = {};

  _startTimeoutId = null;

  _updateTimeoutId = null;

  isEmpty = true;

  reactions = [];

  startedAt = null;

  updatedAt = null;

  constructor(messaging) {
    this._messaging = messaging;
    this._resetResponses();
    makeObservable(this, {
      _createMessage: action,
      _resetResponses: action,
      _responses: observable,
      canReact: computed,
      reactions: observable,
      responses: computed,
      startedAt: observable,
      updatedAt: observable,
    });
  }

  addResponse(response, userId) {
    if (!isNullOrUndefined(this._responses[response])) {
      const pushed = pushUnique(this._responses[response], userId);

      if (pushed) {
        this.reactions.push(response);
      }

      if (this.isEmpty) {
        this.isEmpty = false;
        this._startTimeoutId = setTimeout(
          () => this.aggregate(),
          startTimeout,
        );
        this._updateTimeoutId = setTimeout(
          () => this.aggregate(),
          updateTimeout,
        );
      } else if (pushed) {
        clearTimeout(this._updateTimeoutId);
        this._updateTimeoutId = setTimeout(
          () => this.aggregate(),
          updateTimeout,
        );
      }
    }
  }

  aggregate() {
    clearTimeout(this._updateTimeoutId);
    clearTimeout(this._startTimeoutId);
    this._createMessage();
    this._resetResponses();
    runInAction(() => {
      this.isEmpty = true;
      this.reactions = [];
    });
  }

  hasReacted(reactionType) {
    const responses = this.responses[reactionType];
    return responses.includes(this.messaging.userId);
  }

  get canReact() {
    return !REACTION_LIST.some(reactionType => this.hasReacted(reactionType));
  }

  get meeting() {
    return this.messaging.meeting;
  }

  get messaging() {
    return this._messaging;
  }

  get responses() {
    return this._responses;
  }

  /* Private methods */

  _createMessage() {
    const message = new ReactionsMessage(
      this.messaging,
      this.messaging.userId,
      Date.now(),
      {
        reactions: this._getResponseCounts(),
        data: this._getReactionsData(),
      },
    );
    this.messaging.addMessageToQueue(message);
  }

  _getResponseCounts() {
    return Object.keys(toJS(this.responses)).reduce((acc, o) => ({
      ...acc,
      [o]: this.responses[o].length,
    }), {});
  }

  _getReactionsData() {
    return Object.keys(toJS(this.responses)).reduce((acc, o) => ({
      ...acc,
      [o]: {
        names: this._transformData(toJS(this.responses)[o]),
      },
    }), {});
  }

  _transformData(responses) {
    return responses.reduce((newResponses, userId) => {
      const participant = this.meeting.findOrCreateParticipant(userId);
      if (participant.isLoaded && newResponses.length < MAX_USER_LIMIT) {
        newResponses.push(participant.shortName);
      }
      return newResponses;
    }, []);
  }

  _resetResponses() {
    this._responses = Object.values(ReactionTypes).reduce((acc, o) => ({
      ...acc,
      [o]: [],
    }), {});
  }
}

export default LiveReactions;
