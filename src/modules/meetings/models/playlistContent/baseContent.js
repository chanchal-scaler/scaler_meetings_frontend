import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import findLast from 'lodash/findLast';

import {
  PLAYLIST_CONTENT_STATUS, PLAYLIST_CONTENT_TYPES,
} from '~meetings/utils/playlist';
import { toast } from '@common/ui/general/Toast';
import playlistApi from '~meetings/api/playlist';

class BaseContent {
  isLoading = false;

  isLoaded = false;

  loadError = null;

  contentData = null;

  isQuickViewOpen = false;

  isStarting = false;

  isStopping = false;

  startError = null;

  stopError = null;

  runtimeDuration = null;

  constructor(playlist, data) {
    this._playlist = playlist;
    this._data = data;
    makeObservable(this, {
      isLoading: observable,
      isStarting: observable,
      isStopping: observable,
      loadError: observable.ref,
      canPlay: computed,
      contentData: observable.ref,
      isQuickViewOpen: observable,
      runtimeDuration: observable,
      setQuickViewOpen: action,
      setRuntimeDuration: action,
      activeSession: computed,
      completedSession: computed,
      status: computed,
      isActive: computed,
      isAnyNextContentActiveCompleted: computed,
      isCompleted: computed,
      isFuture: computed,
      isSkipped: computed,
      isUpcoming: computed,
    });
  }

  load = flow(function* () {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    this.loadError = null;
    try {
      const json = yield playlistApi.getPlaylistContent(
        this.meeting.id,
        this.playlist.id,
        this.id,
      );
      this.contentData = json.content_data;
      this.runtimeDuration = json.runtime_duration;
      this.isLoaded = true;
    } catch (error) {
      this.loadError = error;
    }
    this.isLoading = false;
  });

  play = flow(function* () {
    if (this.isStarting || this.isActive) return;

    this.isStarting = true;
    this.startError = null;
    try {
      const json = yield playlistApi.startSession(this.meeting.id, this.id);
      this.playlist.createOrUpdateSession(json.data);
      this.playlist.loadSessions(true);
      this.setProxyChatConfig(json.meta);
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

  stop = flow(function* () {
    if (this.isStopping || !this.isActive) return;

    this.isStopping = true;
    this.stopError = null;
    try {
      yield playlistApi.stopSession(this.meeting.slug);
      this.playlist.loadSessions(true);
      this.disableProxyChat();
    } catch (error) {
      this.stopError = error;
      toast.show({
        message: error?.responseJson?.message
          || 'Failed to stop content. Please retry.',
        type: 'error',
      });
    }
    this.isStopping = false;
  });

  setQuickViewOpen(isOpen) {
    this.isQuickViewOpen = isOpen;
  }

  setRuntimeDuration(duration) {
    this.runtimeDuration = duration;
  }

  setProxyChatConfig(meta) {
    // eslint-disable-next-line camelcase
    if (this.proxyChatMessage && meta?.trigger_allowed) {
      this.proxyChatMessage.handleEnableCueCardBasedChat(meta.chat_templates);
    }
  }

  disableProxyChat() {
    if (this.proxyChatMessage) {
      this.proxyChatMessage.handleDisableCueCardBasedChat();
    }
  }

  get activeSession() {
    return this.sessionList.find(session => session.isActive);
  }

  get completedSession() {
    return this.sessionList.find(session => session.isEnded);
  }

  get canPlay() {
    return [
      PLAYLIST_CONTENT_STATUS.future,
      PLAYLIST_CONTENT_STATUS.upcoming,
    ].includes(this.status);
  }

  get data() {
    return this._data;
  }

  get description() {
    return this.data.description;
  }

  get id() {
    return this.data.id;
  }

  get isActive() {
    return this.status === PLAYLIST_CONTENT_STATUS.active;
  }

  get isAnyNextContentActiveCompleted() {
    return this.playlist.sessionList.some(session => (
      session.content
      && session.content.order > this.order
      && (session.isActive || session.isEnded)
    ));
  }

  get isCompleted() {
    return this.status === PLAYLIST_CONTENT_STATUS.completed;
  }

  get isFirst() {
    return this.order === this.playlist.minContentOrder;
  }

  get isFuture() {
    return this.status === PLAYLIST_CONTENT_STATUS.future;
  }

  get isLast() {
    return this.order === this.playlist.maxContentOrder;
  }

  get isSkipped() {
    return this.status === PLAYLIST_CONTENT_STATUS.skipped;
  }

  get isUpcoming() {
    return this.status === PLAYLIST_CONTENT_STATUS.upcoming;
  }

  get meeting() {
    return this.playlist.meeting;
  }

  get name() {
    return this.data.name;
  }

  get nextContent() {
    // `contentList` is ordered for picking 1st content after current order
    return this.playlist.contentList.find(
      content => content.order > this.order,
    );
  }

  get order() {
    return this.data.order;
  }

  get playlist() {
    return this._playlist;
  }

  get previousContent() {
    // `contentList` is ordered asc, so we are iterating from right
    return findLast(
      this.playlist.contentList,
      content => content.order < this.order,
    );
  }

  get proxyChatMessage() {
    return this.meeting.proxyChatMessage;
  }

  get isInstructorAlumniCard() {
    return [
      PLAYLIST_CONTENT_TYPES.instructorCard, PLAYLIST_CONTENT_TYPES.alumniCard,
    ].includes(this.type);
  }

  get isHtmlCard() {
    return this.type === PLAYLIST_CONTENT_TYPES.htmlCard;
  }

  get status() {
    if (this.activeSession) {
      return PLAYLIST_CONTENT_STATUS.active;
    } else if (this.completedSession) {
      return PLAYLIST_CONTENT_STATUS.completed;
    } else if (this.isAnyNextContentActiveCompleted) {
      return PLAYLIST_CONTENT_STATUS.skipped;
    } else if (
      // This will handle initial state as well because when meeting starts
      // `latestCompletedOrActiveContent` would be null and `previousContent`
      // for first card would anyway be null.
      this.previousContent === this.playlist.latestCompletedOrActiveContent
    ) {
      return PLAYLIST_CONTENT_STATUS.upcoming;
    } else {
      return PLAYLIST_CONTENT_STATUS.future;
    }
  }

  get sessionList() {
    return this.playlist.sessionList.filter(
      session => session.contentId === this.id,
    );
  }

  get type() {
    return this.data.card_type;
  }
}

export default BaseContent;
