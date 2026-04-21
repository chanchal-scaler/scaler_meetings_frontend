import {
  action, computed, flow, makeObservable, observable,
} from '~meetings/shared_modules/mobx';

import { logEvent } from '@common/utils/logger';
import meetingsApi from '@meetings/api/meetings';

class HomeStore {
  isLoaded = false;

  isLoading = false;

  loadError = null;

  isSubmitting = false;

  submitError = false;

  meetings = [];

  editingSlug = null;

  isCreateModalOpen = false;

  constructor() {
    makeObservable(this, {
      isForbidden: computed,
      editingMeeting: computed,
      editingSlug: observable,
      isCreateModalOpen: observable,
      isLoaded: observable,
      isLoading: observable,
      isSubmitting: observable,
      loadError: observable.ref,
      meetings: observable,
      setEditingSlug: action.bound,
      setCreateModalOpen: action.bound,
      submitError: observable.ref,
    });
  }

  load = flow(function* () {
    // Return if meetings are already loaded
    if (this.meetings.length > 0) return;

    this.isLoading = true;
    this.loadError = null;

    try {
      const json = yield meetingsApi.getList();
      this.meetings = json.meetings;
      this.isLoaded = true;
    } catch (error) {
      this.loadError = error;
      logEvent(
        'error',
        'MeetingAdminError: Failed to load meetings',
        error,
      );
    }

    this.isLoading = false;
  });

  createMeeting = flow(function* (data) {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitError = null;

    try {
      const json = yield meetingsApi.create(data);
      if (json?.meeting) {
        this.meetings = [json.meeting, ...this.meetings];
      }
      this.setCreateModalOpen(false);
      this.isSubmitting = false;
    } catch (error) {
      this.submitError = error;
      this.isSubmitting = false;
      logEvent(
        'error',
        'MeetingAdminError: Failed to create meeting',
        error,
      );
      throw error;
    }
  });

  updateMeeting = flow(function* (data) {
    if (this.isSubmitting || this.meetings.length === 0) return;

    this.isSubmitting = true;
    this.submitError = null;

    try {
      const json = yield meetingsApi.update(this.editingSlug, data);
      const index = this.meetings.findIndex(o => o.slug === this.editingSlug);
      if (index >= 0 && json?.meeting) {
        this.meetings = this.meetings.map((meeting, meetingIndex) => (
          meetingIndex === index ? json.meeting : meeting
        ));
      }
      this.setEditingSlug(null);
      this.isSubmitting = false;
    } catch (error) {
      this.submitError = error;
      this.isSubmitting = false;
      logEvent(
        'error',
        'MeetingAdminError: Failed to update meeting',
        error,
      );
      throw error;
    }
  });

  setEditingSlug(slug) {
    this.editingSlug = slug;
  }

  setCreateModalOpen(isOpen) {
    this.isCreateModalOpen = isOpen;
  }

  get editingMeeting() {
    if (this.editingSlug) {
      return this.meetings.find(o => o.slug === this.editingSlug);
    } else {
      return null;
    }
  }

  get isForbidden() {
    return (
      this.loadError
      && this.loadError.isFromServer
      && this.loadError.response.status === 403
    );
  }
}

const homeStore = new HomeStore();

export default homeStore;
