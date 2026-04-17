import {
  action, computed, flow, makeObservable,
} from 'mobx';

import {
  DEFAULT_DURATION,
} from '~meetings/utils/quiz';
import { toast } from '@common/ui/general/Toast';
import BaseContent from './baseContent';
import playlistApi from '~meetings/api/playlist';

class ProblemContent extends BaseContent {
  constructor(...args) {
    super(...args);
    makeObservable(this, {
      choices: computed,
      question: computed,
      duration: computed,
      updateDuration: action,
    });
  }

  get choices() {
    return this.contentData?.choices || [];
  }

  get question() {
    return this.contentData?.description;
  }

  get duration() {
    return this.runtimeDuration;
  }

  updateDuration(duration) {
    this.setRuntimeDuration(duration);
  }

  // overriding base content's play method to add quiz duration
  play = flow(function* () {
    if (this.isStarting || this.isActive) return;

    this.isStarting = true;
    this.startError = null;
    try {
      // NOTE: passing updated runtime_duration in ONLY quiz case
      const json = yield playlistApi.startSession(
        this.meeting.id, this.id, {
          runtime_duration: this.runtimeDuration || DEFAULT_DURATION,
        },
      );
      this.playlist.createOrUpdateSession(json.data);
      this.playlist.loadSessions(true);
    } catch (error) {
      this.startError = error;
      toast.show({
        message: error?.responseJson?.message
          || 'Failed to start content. Please retry.',
        type: 'error',
      });
    }
    this.isStarting = false;
  });
}

export default ProblemContent;
