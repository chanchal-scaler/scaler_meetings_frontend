import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';

import { enterFullscreen, exitFullscreen } from '@common/utils/browser';
import { isRotationSupported } from '~meetings/utils/media';
import { logEvent } from '@common/utils/logger';
import Archive from '~meetings/models/archive';
import Meeting from '~meetings/models/meeting';
import meetingsApi from '~meetings/api/meetings';
import pluginsStore from './pluginsStore';
import attachmentStore from './attachmentStore';

const POLL_INTERVAL_STEP = 3;

class MeetingStore {
  _data = null;

  _polls = 0;

  constructor() {
    makeObservable(this, {
      _data: observable,
      archive: observable.ref,
      data: computed,
      errorMessage: computed,
      isLoading: observable,
      loadArchive: action.bound,
      loadError: observable.ref,
      loadMeeting: action.bound,
      unloadMeeting: action.bound,
      meeting: observable.ref,
      isFixableError: computed,
      isUsingLandscape: observable,
      setUsingLandscape: action.bound,
      unload: action.bound,
    });
  }

  /**
   * Indicates if meeting is being loaded
   */
  isLoading = false;

  /**
   * Indicates if meeting failed to load
   */
  loadError = null;

  archive = null;

  meeting = null;

  pollTimeout = null;

  isUsingLandscape = false;

  async checkForUpdate() {
    // If update already enqueued then return
    if (this.pollTimeout) return;

    this._polls += 1;
    await this.load(this.data.slug, true);
    if (this.data.status === 'upcoming') {
      this.pollTimeout = setTimeout(
        () => {
          this.pollTimeout = null;
          this.checkForUpdate();
        },
        this._polls * POLL_INTERVAL_STEP * 1000,
      );
    } else {
      this._polls = 0;
    }
  }

  async enterFullscreen(element) {
    try {
      await enterFullscreen(element);
      if (isRotationSupported()) {
        this.setUsingLandscape(true);
        window.screen.orientation.lock('landscape-primary');
      }
    } catch (error) {
      logEvent('error', 'UIError: Failed to enter fullscreen', error);
    }
  }

  async exitFullscreen() {
    if (isRotationSupported()) {
      window.screen.orientation.unlock();
      this.setUsingLandscape(false);
    }
    await exitFullscreen();
  }

  load = flow(function* (slug, forceServer = false) {
    if (
      this.data
      && (this.data.slug === slug)
      && !forceServer
    ) {
      return;
    }

    this.isLoading = true;
    this.loadError = null;

    try {
      const json = yield meetingsApi.getItem(slug);
      this._data = json.meeting;
    } catch (error) {
      this.loadError = error;
      logEvent(
        'error',
        'MeetingError: Failed to load meeting',
        error,
      );
    }

    this.isLoading = false;
  });

  loadArchive(slug) {
    if (!this.archive || this.archive.slug !== slug) {
      this.archive = new Archive(this._data);
    }
  }

  loadMeeting(slug) {
    if (!this.meeting || this.meeting.slug !== slug) {
      this.meeting = new Meeting(this._data);
      pluginsStore.load(slug, this.meeting);
    }
  }

  unloadMeeting() {
    this.meeting = null;
    pluginsStore.reset();
  }

  setUsingLandscape(isLandscape) {
    this.isUsingLandscape = isLandscape;
  }

  unload() {
    this._polls = 0;
    this.pollTimeout = null;
    this.meeting = null;
    this._data = null;
    this.archive = null;
    pluginsStore.reset();
    attachmentStore.reset();
  }

  get data() {
    return this._data;
  }

  get errorMessage() {
    if (this.loadError) {
      if (this.loadError.isFromServer) {
        switch (this.loadError.response.status) {
          case 404:
            return 'The meeting you are looking for does not exist!';
          case 403:
            return 'You have been banned from this meeting, contact '
              + 'info@scaler.com if you think you were banned for incorrect '
              + 'reasons';
          default:
            return 'Something went wrong! Please try again in sometime';
        }
      } else {
        return 'Failed to connect with server. '
          + 'Please make sure that you are connected to internet';
      }
    } else {
      return '';
    }
  }

  get isFixableError() {
    return (
      !this.loadError.isFromServer
      || (this.loadError.response.status >= 500)
    );
  }

  get slug() {
    return this.data && this.data.slug;
  }

  get isSuperHost() {
    return (
      this.data
      && this.data.participant
      && this.data.participant.role === 'super_host'
    );
  }

  get participant() {
    return this.data.participant;
  }
}

const meetingStore = new MeetingStore();

export default meetingStore;
