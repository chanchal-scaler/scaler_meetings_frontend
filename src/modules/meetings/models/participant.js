import {
  action, computed, makeObservable, observable, toJS,
} from 'mobx';

import { getRoleLevel } from '~meetings/utils/role';
import { HAND_RAISE_TIMEOUT } from '~meetings/utils/constants';
import meetingEvents from '~meetings/events';

// eslint-disable-next-line
const DUMMY_AVATAR_URL = 'https://ibassets.s3.amazonaws.com/static-assets/new_default_pp.svg';
const DEFAULT_NAME = 'User';

const dummyData = {
  avatar: null,
  name: 'User',
};

class Participant {
  _handRaiseTimeout = false;

  /**
   * Indicates if participant data is loaded or not
   */
  isLoaded = false;

  /**
   * Indicates if the participant has joined atleast once in the current
   * meeting.
   */
  hasJoined = false;

  /**
   * Indicates if the participant is currently in the meeting.
   */
  isActive = false;

  /**
   * Valid only for participants whose role is audience. Indicates if user
   * has raised hand. Auto resets after a minute
   */
  isHandRaised = false;

  static createDummy(meeting, userId) {
    const data = {
      ...dummyData,
      user_id: userId,
    };

    return new Participant(meeting, data, false, false);
  }

  constructor(
    meeting,
    data,
    hasJoined = false,
    isLoaded = true,
  ) {
    this._meeting = meeting;
    this._data = data;
    this.isLoaded = isLoaded;

    this.setJoined(hasJoined);
    makeObservable(this, {
      _data: observable.ref,
      _meeting: observable.ref,
      avatar: computed,
      data: computed,
      hasJoined: observable,
      id: computed,
      isActive: observable,
      isBanned: computed,
      isBot: computed,
      isCurrentUser: computed,
      isGhost: computed,
      isHandRaised: observable,
      isHost: computed,
      isLoaded: observable,
      isUnmuted: computed,
      isChatDisabled: computed,
      meeting: computed,
      name: computed,
      role: computed,
      roleLevel: computed,
      setActive: action.bound,
      setBanned: action.bound,
      setData: action.bound,
      setHandRaised: action.bound,
      setJoined: action.bound,
      setUnmuted: action.bound,
      setChatDisabled: action.bound,
      shortName: computed,
      userId: computed,
    });
  }

  /* Public methods/getters */

  setActive(isActive) {
    this.isActive = isActive;

    if (isActive) {
      this.setJoined(true);
      this.meeting.dispatchEvent(
        meetingEvents.PARTICIPANT_JOINED,
        this.toJSON(),
      );
    } else {
      this.meeting.dispatchEvent(
        meetingEvents.PARTICIPANT_LEFT,
        this.toJSON(),
      );
    }
  }

  setBanned(isBanned) {
    this.setData({ banned: isBanned });
  }

  setData(data) {
    const staleData = this._data;
    const updatedData = {
      ...staleData,
      ...data,
    };
    this._data = updatedData;
  }

  setJoined(hasJoined) {
    this.hasJoined = hasJoined;
  }

  setHandRaised(isHandRaised) {
    clearTimeout(this._handRaiseTimeout);
    this.isHandRaised = isHandRaised;
    if (isHandRaised) {
      setTimeout(() => {
        this.setHandRaised(false);
      }, HAND_RAISE_TIMEOUT * 1000);
    }
  }

  setLoaded(isLoaded) {
    this.isLoaded = isLoaded;
  }

  setUnmuted(isUnmuted) {
    this.setData({ is_unmuted: isUnmuted });
  }

  setChatDisabled(isChatDisabled) {
    this.setData({ is_chat_disabled: isChatDisabled });
  }

  toJSON() {
    return toJS(this.data);
  }

  get avatar() {
    if (this._data.avatar && this._data.avatar !== DUMMY_AVATAR_URL) {
      return this._data.avatar;
    } else {
      return null;
    }
  }

  get data() {
    return this._data;
  }

  get isBanned() {
    return Boolean(this._data.banned);
  }

  get isCurrentUser() {
    return this.userId === this.meeting.userId;
  }

  get isBot() {
    return this._data.is_bot;
  }

  get isGhost() {
    return Boolean(this._data.ghost);
  }

  get isHost() {
    return this.roleLevel > 0;
  }

  get isUnmuted() {
    return Boolean(this._data.is_unmuted);
  }

  get isChatDisabled() {
    return Boolean(this._data.is_chat_disabled);
  }

  get meeting() {
    return this._meeting;
  }

  get name() {
    return this._data.name || DEFAULT_NAME;
  }

  get role() {
    return this._data.role || 'audience';
  }

  get roleLevel() {
    return getRoleLevel(this.role);
  }

  get shortName() {
    return this.name.split(' ').slice(0, 2).join(' ');
  }

  get id() {
    return String(this._data.id);
  }

  get userId() {
    return String(this._data.user_id);
  }
}

export default Participant;
