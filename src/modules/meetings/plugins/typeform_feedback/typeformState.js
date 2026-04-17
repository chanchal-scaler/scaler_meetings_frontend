import {
  action, computed, makeObservable, observable,
} from 'mobx';

import { apiRequest } from '@common/api/utils';

/**
 * Because the logic of typeform needs to be shared by multiple plugins
 * we are moving all such logic to this class so that code can be reused
 */
class TypeformState {
  /**
   * Stores time left to unlock in seconds
   */
  timeLeftToUnlock = 100000;

  constructor(data, meeting) {
    this._data = data;
    this._meeting = meeting;
    this._updateTimeLeftToUnlock();
    this._startUnlockCountdown();
    makeObservable(this, {
      _data: observable.ref,
      _updateTimeLeftToUnlock: action,
      data: computed,
      isSubmitted: computed,
      isUnlocked: computed,
      timeLeftToUnlock: observable,
      updateData: action,
    });
  }

  destroy() {
    clearInterval(this._unlockCountdown);
  }

  markSubmitted() {
    if (this.data.submission_api) {
      apiRequest('POST', this.data.submission_api, {
        typeform_url: this.link,
        ...this.submissionBody,
      });
    }
    this.updateData({ is_submitted: true });
  }

  updateData(newData) {
    this._data = {
      ...this._data,
      ...newData,
    };
  }

  get data() {
    return this._data;
  }

  get formId() {
    return this.data.form_id;
  }

  get hiddenFields() {
    return this.data.hidden_fields;
  }

  get isSubmitted() {
    return this.data.is_submitted;
  }

  get isUnlocked() {
    return this.timeLeftToUnlock <= 0;
  }

  get link() {
    return this.data.link;
  }

  get submissionBody() {
    return this.data.submission_body || {};
  }

  get unlocksIn() {
    return this.data.unlocks_in || 0;
  }

  get unlocksOn() {
    return new Date(
      new Date(this.meeting.startTime).getTime()
      + (this.unlocksIn * 1000),
    );
  }

  get meeting() {
    return this._meeting;
  }

  _startUnlockCountdown() {
    if (!this.isUnlocked) {
      this._unlockCountdown = setInterval(() => {
        if (this.isUnlocked) {
          clearInterval(this._unlockCountdown);
          return;
        }

        this._updateTimeLeftToUnlock();
      }, 1000);
    }
  }

  _updateTimeLeftToUnlock() {
    const startTime = new Date(this.meeting.startTime);
    const timeElapsed = (Date.now() - startTime.getTime()) / 1000;
    this.timeLeftToUnlock = Math.max(0, this.unlocksIn - timeElapsed);
  }
}

export default TypeformState;
