import {
  action,
  computed,
  makeObservable,
  flow,
  observable,
} from 'mobx';
import cogoToast from 'cogo-toast';

import { logEvent } from '@common/utils/logger';
import { PluginNames } from '~meetings/plugins/utils';
import { toHHmm } from '@common/utils/date';
import TabPlugin from '~meetings/plugins/tabPlugin';
import timeSlotsApi from './api/timeSlots';
import ReschedulePage from './reschedulePage';

class RescheduleMenteeMentorSession extends TabPlugin {
  static pluginName = PluginNames.rescheduleMenteeMentorSessionPlugin;

  static Component = ReschedulePage;

  static tabName = 'Reschedule';

  static tabIcon = 'clock';

  static unmountWhenHidden = false;

  static tabLabel = 'Reschedule';

  _state = null;

  constructor(store, data, meeting) {
    super(store, data, meeting);

    this._state = {
      role: data.role,
      isLoading: false,
      loadError: false,
      message: null,
      sessionData: null,
      allowRedirection: false,
      redirectionLink: null,
      bothJoined: false,
      mentee: {
        isLoading: false,
        loadError: false,
        mentorTimeSlots: null,
        selectedDateTime: null,
      },
      mentor: {
        isLoading: false,
        loadError: false,
        slotsForSelect: [],
        selectedDate: null,
        selectedTime: null,
      },
    };

    this._setTimer();
    makeObservable(this, {
      _state: observable,
      isMentee: computed,
      isMentor: computed,
      updateMenteeSelectedTime: action,
      updateMentorSelectedTime: action,
      updateMentorSelectedDate: action,
      _setTimer: action,
      setBothJoined: action,
    });
  }

  get badge() {
    if (this._state.bothJoined) return false;
    if (!(this._state.sessionData
        && this._state.sessionData.canShowReschedule)
    ) {
      return false;
    }

    return 1;
  }

  // eslint-disable-next-line class-methods-use-this
  get badgeProps() {
    return { type: 'alert' };
  }

  load = flow(function* () {
    if (this._state.bothJoined) {
      this._state.message = `Looks like your
      ${this.isMentee ? 'mentor ' : 'mentee '} have joined
      the session. You will not be allowed to reschedule it.`;
      return;
    }

    this._state.message = null;
    this._state.isLoading = true;
    this._state.loadError = null;
    this.track('load-data');

    try {
      const json = yield timeSlotsApi.getInitialData(
        this.meeting.slug,
      );
      if (json.setTimer) {
        this._state.message = json.rescheduleMessage;
        this._setTimer(json.remainingTime);
      } else {
        this._state.sessionData = json;
      }
    } catch (error) {
      this.loadError = error;
      logEvent(
        'error',
        'MenteeMentorSession: Failed to load session data',
        error,
      );
    }

    this._state.isLoading = false;
  });

  get isMentee() {
    return this.state.role === 'mentee';
  }

  get isMentor() {
    return this.state.role === 'mentor';
  }

  setBothJoined = function () {
    this._state.bothJoined = true;
  }

  /*
    If there are no available slots then we don't need to display them
  */
  hasAvailableSlots = function (slotsObj) {
    // Max len could be 48
    for (let i = 0; i < slotsObj.slots.length; i += 1) {
      if (slotsObj.is_available[i]) {
        return true;
      }
    }
    return false;
  }

  loadMenteeData = flow(function* () {
    const { mentee: menteeState } = this._state;
    menteeState.isLoading = true;

    try {
      const json = yield timeSlotsApi.getInitialDataMentee();
      if (json.timeSlots) {
        menteeState.mentorTimeSlots = json.timeSlots.filter(
          (slotsObj) => this.hasAvailableSlots(slotsObj[1]),
        );
      } else {
        menteeState.loadError = true;
      }
    } catch (error) {
      menteeState.loadError = true;
      logEvent(
        'error',
        'MenteeMentorSession: Failed to load data for mentee',
        error,
      );
    }
    menteeState.isLoading = false;
  })

  loadMentorData = flow(function* () {
    const { mentor: mentorState } = this._state;
    mentorState.isLoading = true;

    try {
      const json = yield timeSlotsApi.getInitialDataMentor();
      if (json.all_slots) {
        mentorState.slotsForSelect = json.all_slots.map((slot) => (
          {
            label: toHHmm(new Date(`1970/01/01 ${slot}`)),
            value: slot,
          }
        ));
      } else {
        mentorState.loadError = true;
      }
    } catch (error) {
      mentorState.loadError = true;
      logEvent(
        'error',
        'MenteeMentorSession: Failed to load data for mentor',
        error,
      );
    }
    mentorState.isLoading = false;
  })

  updateMenteeSelectedTime = function (selectedTimeSlot) {
    this.track('mentee-select-datetime');
    this._state.mentee.selectedDateTime = selectedTimeSlot;
  };

  updateMentorSelectedTime = function (selectedTimeSlot) {
    this.track('mentor-select-datetime', 'click', 'time');
    this._state.mentor.selectedTime = selectedTimeSlot;
  }

  updateMentorSelectedDate = function (selectedDate) {
    this.track('mentor-select-datetime', 'click', 'date');
    this._state.mentor.selectedDate = selectedDate;
  }

  rescheduleSessionFromMentee = flow(function* () {
    try {
      const json = yield timeSlotsApi.rescheduleSessionMentee(
        this._state.sessionData.ongoingSessionId,
        this._state.mentee.selectedDateTime,
      );
      if (json.success) {
        cogoToast.success(json.msg);
        this.track('reschedule-session', 'click', this._state.role);
      } else {
        cogoToast.error(json.msg);
      }

      if (json.path) {
        this._state.allowRedirection = true;
        this._state.redirectionLink = json.path;
      }
    } catch (error) {
      logEvent(
        'error',
        'MenteeMentorSession: Failed to reschedule session by mentee',
        error,
      );
    }
  })

  rescheduleSessionFromMentor = flow(function* () {
    try {
      const json = yield timeSlotsApi.rescheduleSessionMentor(
        this._state.sessionData.ongoingSessionId,
        this._state.mentor.selectedDate,
        this._state.mentor.selectedTime.value,
      );
      if (json.success) {
        this.track('reschedule-session', 'click', this._state.role);
        cogoToast.success(json.msg);
      } else {
        cogoToast.error(json.msg);
      }

      if (json.path) {
        const feedbackPlugin = this.store.findPlugin(
          'TypeformFeedbackTabPlugin',
        );
        if (feedbackPlugin) {
          /*
            Updating the typeform submitted state to true
            so that it doesn't ask while leaving page
          */
          feedbackPlugin.state.updateData({ is_submitted: true });
        }
        this._state.allowRedirection = true;
        this._state.redirectionLink = json.path;
      }
    } catch (error) {
      logEvent(
        'error',
        'MenteeMentorSession: Failed to reschedule session by mentor',
        error,
      );
    }
  })

  requestMoreTimeSlotsFromMentor = flow(function* () {
    try {
      const json = yield timeSlotsApi.requestTimeSlots();
      this.track('request-more-slots-mentor');
      if (json.success) {
        cogoToast.success(json.msg);
      } else {
        cogoToast.error(json.msg);
      }

      cogoToast.info('You may end the call.');
    } catch (error) {
      cogoToast.error('There was some error. Please try later');
      logEvent(
        'error',
        'MenteeMentorSession: Failed to request time slot from mentor',
        error,
      );
    }
  })

  _setTimer(alreadyComputedTime = null) {
    if (this.meeting.activeParticipants.length < 2) {
      if (alreadyComputedTime) {
        setTimeout(() => {
          this.load();
        }, [(alreadyComputedTime + 1) * 1000]);
      } else {
        const meetingStartTime = new Date(this.meeting.startTime);
        const toAllowRescheduleAfter = ((5 * 60) + 1) * 1000;
        const rescheduleAskingTime = new Date(
          meetingStartTime.getTime() + toAllowRescheduleAfter,
        );
        const currentTime = new Date();
        if (currentTime > rescheduleAskingTime) {
          this._state.message = null;
          this.load();
        } else {
          const timeoutTime = rescheduleAskingTime - currentTime;
          const str = `Rescheduling will be enabled 5 mins post the session 
          start time at ${toHHmm(rescheduleAskingTime)}, incase
          your ${this.isMentee ? 'mentor' : 'mentee'} doesn't join.`;

          this._state.message = str;

          setTimeout(() => {
            this.load();
          }, [timeoutTime]);
        }
      }
    } else {
      this._state.bothJoined = true;
    }
  }

  get state() {
    return this._state;
  }

  // eslint-disable-next-line class-methods-use-this
  track(actionType, ...args) {
    return new Promise(resolve => {
      if (actionType && window.storeEsEvent) {
        window.storeEsEvent(
          `drona-mentor-session-${actionType}`,
          ...args,
        );
      }
      resolve();
    });
  }
}

export default RescheduleMenteeMentorSession;
