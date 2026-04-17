import {
  action, computed, makeObservable, observable, flow, toJS,
} from 'mobx';
import camelCase from 'lodash/camelCase';

import { addBookmarkGTMEvent } from '~meetings/utils/gtm';
import { canHideNegativeContent } from '~meetings/utils/meeting';
import { DEFAULT_MEETING_CONFIG } from '~meetings/utils/constants';
import { getDeviceType, getRequestSource } from '@common/utils/platform';
import { notifyWebview } from '@common/utils/webview';
import analytics from '~meetings/analytics';
import bookmarksApi from '~meetings/api/bookmarks';
import layoutStore from '~meetings/stores/layoutStore';
import meetingEvents from '~meetings/events';
import Participant from './participant';

const GA_ENABLED = true;

const ACTION_CATEGORY = 'drona_actions';

const deviceType = getDeviceType();
const devicePlatform = getRequestSource();

class MeetingBase {
  _allBookmarks = {};

  bookmarkInput = '';

  bookmarkInputVisible = false;

  scrollToBookmarkSlug = null;

  participants = observable.map({}, { deep: false });

  isCreatingBookmark = false;

  activeTab = 'chat';

  constructor(data) {
    this._data = data;
    makeObservable(this, {
      _allBookmarks: observable,
      _data: observable.ref,
      activeTab: observable,
      bookmarkInput: observable,
      bookmarkInputVisible: observable,
      currentParticipant: computed,
      data: computed,
      isCreatingBookmark: observable,
      scrollToBookmarkSlug: observable,
      setActiveTab: action.bound,
      // Do not use `action.bound` has it does not allowing overriding this method
      // in extending classes
      setBookmarkInput: action,
      setScrollToBookmarkSlug: action,
      setBookmarkInputVisible: action,
      shouldHideNegativeContent: computed,
      findOrCreateParticipant: action,
      hasBookmarks: computed,
      numBookmarks: computed,
      isGhost: computed,
      isSuperHost: computed,
      name: computed,
      slug: computed,
      status: computed,
      resources: computed,
      type: computed,
      user: computed,
    });
  }

  /* Public */

  deleteBookmark = flow(function* (bookmarkSlug) {
    yield bookmarksApi.delete(this.slug, bookmarkSlug);
    delete this._allBookmarks[bookmarkSlug];
  }).bind(this);

  setActiveTab(tab) {
    this.activeTab = tab;
    this.track(`drona-tab-switched-${tab}`);
  }

  setBookmarkInput(value) {
    this.bookmarkInput = value;
  }

  dispatchEvent(eventType, data) {
    const payload = this._createEventPayload(eventType, data);
    if (layoutStore.isWidget) {
      meetingEvents.emit(
        eventType,
        payload,
      );
    }
    const eventName = camelCase(`on_${eventType}`);
    notifyWebview(eventName, data);
    window.dispatchEvent(
      new CustomEvent(
        eventType,
        { detail: payload },
      ),
    );
  }

  toJSON() {
    return toJS(this.data);
  }

  findOrCreateParticipant(userId) {
    const uid = String(userId);

    if (!this.participants.has(uid)) {
      const participant = Participant.createDummy(this, uid);
      this.participants.set(uid, participant);
    }

    return this.participants.get(uid);
  }

  getParticipant(userId) {
    const uid = String(userId);

    if (this.participants.has(uid)) {
      return this.participants.get(uid);
    } else {
      // NOTE: This is being used for proxy messages
      // even in case of same user id, messages will be from separate user name
      // as the participant created is not stored any where in meeting store
      return Participant.createDummy(this, uid);
    }
  }

  updateBookmark = flow(function* (data) {
    const json = yield bookmarksApi.update(
      this.slug,
      {
        description: data.description,
        title: data.title,
        slug: data.slug,
      },
    );
    addBookmarkGTMEvent(this.slug, data.description?.length, true);
    this._allBookmarks[data.slug] = json.bookmark;
  }).bind(this);

  updateParticipant(data) {
    const participant = this.findOrCreateParticipant(data.user_id);
    participant.setData(data);
    participant.setLoaded(true);
    return participant;
  }

  updateParticipants(participants) {
    participants.forEach(participant => {
      this.updateParticipant(participant);
    });
  }

  setScrollToBookmarkSlug(value) {
    this.scrollToBookmarkSlug = value;
  }

  setBookmarkInputVisible(value) {
    this.bookmarkInputVisible = value;
  }

  // Making this as promise so that error caused by the code we write
  // in this should never break the application
  track(actionType, ...args) {
    return new Promise(resolve => {
      if (GA_ENABLED && window.trackGaEvent) {
        window.trackGaEvent(
          ACTION_CATEGORY,
          `${this.slug}::${this.userId}`,
          actionType,
          Date.now(),
        );
      }
      if (window.storeEsEvent) {
        window.storeEsEvent(actionType, ...args);
      }
      resolve();
    });
  }

  trackEvent(eventName, attributes = {}) {
    return new Promise(resolve => {
      analytics.event(
        eventName,
        'Meeting App', {
          meetingId: this.id,
          meetingSlug: this.slug,
          meetingType: this.type,
          meetingStatus: this.status,
          mode: layoutStore.mode,
          widget: layoutStore.isWidget,
          role: this.user.role,
          deviceType,
          devicePlatform,
          ...attributes,
        },
      );
      resolve();
    });
  }

  get currentParticipant() {
    return this.getParticipant(this.user.user_id);
  }

  get config() {
    return { ...DEFAULT_MEETING_CONFIG, ...this._data.config };
  }

  get data() {
    return this._data;
  }

  get startTime() {
    return this._data.start_time;
  }

  get endTime() {
    return this._data.end_time;
  }

  get hasBookmarks() {
    return this.numBookmarks > 0;
  }

  get id() {
    return this._data.id;
  }

  get isGhost() {
    return this.user.ghost;
  }

  get isSuperHost() {
    return this.user.role === 'super_host';
  }

  get name() {
    return this.data.name;
  }

  get numBookmarks() {
    return Object.keys(this._allBookmarks).length;
  }

  get resources() {
    return this.data.resources || {};
  }

  get shouldHideNegativeContent() {
    return !this.isSuperHost && canHideNegativeContent(this.type);
  }

  get slug() {
    return this.data.slug;
  }

  get status() {
    return this.data.status;
  }

  get type() {
    return this.data.type;
  }

  get user() {
    const { participant } = this.data;
    if (participant) {
      return { ...participant, user_id: String(participant.user_id) };
    } else {
      return null;
    }
  }

  get userId() {
    return this.user.user_id;
  }

  /* Private */

  _createBookmarks(bookmarks) {
    bookmarks.forEach(this._addBookmark);
  }

  _addBookmark = (bookmark) => {
    this._allBookmarks[bookmark.slug] = bookmark;
  }

  _createParticipants(participants) {
    this.participants.clear();

    participants.forEach(item => {
      const participant = new Participant(this, item);
      const userId = String(item.user_id);
      this.participants.set(userId, participant);
    });
  }

  _createEventPayload(eventType, data) {
    return {
      eventType,
      meeting: this.toJSON(),
      data,
    };
  }
}

export default MeetingBase;
