import {
  action, computed, flow, makeObservable, observable, reaction,
} from 'mobx';
import orderBy from 'lodash/orderBy';

import AudioNotification from '@common/lib/audioNotification';
import { toast } from '@common/ui/general/Toast';
import recordingApi from '~meetings/api/recording';

const UPDATE_POLL_INTERVAL = 60; // In sec

const MAX_CONSECUTIVE_FAILURES = 1;

const alertNotification = new AudioNotification('alert');

class Recording {
  _data = {};

  isSubmitting = false;

  submitError = null;

  isUpdating = false;

  updateError = null;

  _consecutiveUpdateFailures = 0;

  constructor(meeting, data) {
    this._meeting = meeting;
    this.setData(data);

    this._addStreamChangeReaction();
    // TODO Move this to socket
    this._addPollReaction();
    this.load();
    makeObservable(this, {
      _data: observable.ref,
      canControl: computed,
      controlledBy: computed,
      isActive: computed,
      isAuto: computed,
      isControlling: computed,
      isSubmitting: observable,
      meeting: computed,
      order: computed,
      setData: action.bound,
      shouldUpdate: computed,
      startTime: computed,
      submitError: observable.ref,
      user: computed,
      videoBroadcasting: computed,
    });
  }

  destroy() {
    clearInterval(this._updateInterval);

    if (this._pollReaction) {
      this._pollReaction();
    }

    if (this._streamChangeReaction) {
      this._streamChangeReaction();
    }
  }

  load() {
    if (this.isActive) {
      return;
    }

    this.manager.loadRecordingStatus();
  }

  start = flow(function* () {
    if (!this.canControl) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      yield recordingApi.start(this.slug, this.order);
      this.setData({ active: true, user_id: this.user.user_id });
      this.isSubmitting = false;
    } catch (error) {
      this.submitError = error;
      this.isSubmitting = false;
      throw error;
    }
  });

  stop = flow(function* () {
    if (!this.canControl) {
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      yield recordingApi.stop(this.slug);
      this.setData({ active: false, user_id: null });
      this.isSubmitting = false;
    } catch (error) {
      this.submitError = error;
      this.isSubmitting = false;
      throw error;
    }
  });

  update = flow(function* () {
    if (!this.shouldUpdate || this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    this.updateError = null;

    try {
      yield recordingApi.update(this.slug, this.order);
      this._consecutiveUpdateFailures = 0;
    } catch (error) {
      this.updateError = error;
      this._consecutiveUpdateFailures += 1;
      if (this._consecutiveUpdateFailures > MAX_CONSECUTIVE_FAILURES) {
        toast.show({
          message: `We noticed an issue in this meeting.
            Please refresh to fix it.`,
          type: 'error',
          duration: UPDATE_POLL_INTERVAL * 1000,
        });
        alertNotification.play();
      }
    }

    this.isUpdating = false;
  });

  setData(data) {
    this._data = {
      ...this._data,
      ...data,
    };
  }

  get canControl() {
    return (
      !this.isAuto
      && this.user.role === 'super_host'
      && this.videoBroadcasting
      && this.videoBroadcasting.isStreaming
      && (
        !this.isActive
        || this.isControlling
      )
    );
  }

  get controlledBy() {
    return String(this._data.user_id || 'system');
  }

  get isActive() {
    return this._data.active;
  }

  get isAuto() {
    return this._data.auto;
  }

  get isControlling() {
    return (
      this.isActive
      && this.controlledBy === this.user.user_id
    );
  }

  get manager() {
    return this.meeting.manager;
  }

  get meeting() {
    return this._meeting;
  }

  get order() {
    if (this.videoBroadcasting) {
      const list = orderBy(
        this.videoBroadcasting.webrtcStreamsList,
        ['type', 'volumeLevel'],
        ['desc', 'desc'],
      );
      return list.map(o => o.id);
    } else {
      return [];
    }
  }

  get shouldUpdate() {
    return (
      (this.isActive || this.isAuto)
      && (this.meeting.roleLevel > 0 || this.manager.isTemporaryHost)
      && this.order.length > 0
    );
  }

  get slug() {
    return this.meeting.slug;
  }

  get startTime() {
    return this._data.start_time;
  }

  get user() {
    return this.meeting.user;
  }

  get videoBroadcasting() {
    return this.meeting.videoBroadcasting;
  }

  /* Private */

  _addStreamChangeReaction() {
    if (this.videoBroadcasting) {
      this._streamChangeReaction = reaction(
        () => [
          this.videoBroadcasting.webrtcStreamsList.length,
          this.manager.activeScreenUserId,
        ].join('-'),
        () => this.update(),
        { delay: 500 },
      );
    }
  }

  _addPollReaction() {
    this._pollReaction = reaction(
      () => ({ isActive: this.isActive, isAuto: this.isAuto }),
      () => this._addUpdatePoll(),
      { fireImmediately: true },
    );
  }

  // This is just a fail safe way to make sure that recordings layout is
  // up to date
  _addUpdatePoll() {
    clearInterval(this._updateInterval);
    if (this.meeting.roleLevel > 0 && (this.isActive || this.isAuto)) {
      this._updateInterval = setInterval(
        () => this.update(),
        UPDATE_POLL_INTERVAL * 1000,
      );
    }
  }
}

export default Recording;
