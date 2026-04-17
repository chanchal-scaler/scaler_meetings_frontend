import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import orderBy from 'lodash/orderBy';
import max from 'lodash/max';
import maxBy from 'lodash/maxBy';
import min from 'lodash/min';

import { PLAYLIST_CONTENT_TYPES } from '~meetings/utils/playlist';
import playlistsApi from '~meetings/api/playlist';
import PlaylistContentFactory from './playlistContent/factory';
import PlaylistContentSession from './playlistContent/session';

class Playlist {
  isContentsLoading = false;

  isContentsLoaded = false;

  contentsLoadError = null;

  isSessionsLoading = false;

  isSessionsLoaded = false;

  sessionsLoadError = null;

  contents = observable.map({}, { deep: false });

  sessions = observable.map({}, { deep: false });

  isVisible = true;

  constructor(meeting, id) {
    this._meeting = meeting;
    this._id = id;

    this.loadContents();
    makeObservable(this, {
      activeContent: computed,
      createOrUpdateSession: action,
      contentsLoadError: observable.ref,
      isComposedVideoPlaying: computed,
      isContentsLoading: observable,
      isSessionsLoading: observable,
      sessionsLoadError: observable.ref,
      contentList: computed,
      hasComposedVideo: computed,
      isComposedVideoContentActive: computed,
      isToggleEnabled: computed,
      isVisible: observable,
      latestCompletedOrActiveContent: computed,
      minContentOrder: computed,
      maxContentOrder: computed,
      setVisible: action,
      sessionList: computed,
    });
  }

  createOrUpdateSession(data) {
    if (this.sessions.has(data.id)) {
      const session = this.sessions.get(data.id);
      session.updateData(data);
    } else {
      const session = new PlaylistContentSession(this, data);
      this.sessions.set(data.id, session);
    }
  }

  loadContents = flow(function* () {
    if (this.isContentsLoading || this.isContentsLoaded) return;

    this.isContentsLoading = true;
    this.contentsLoadError = null;
    try {
      const json = yield playlistsApi.getPlaylist(
        this.id,
        this.meeting.id,
      );
      json.playlist_contents.forEach(data => this._createContent(data));
      this.isContentsLoaded = true;

      /*
        Initially playlist was closed by default and we opened it
        only if video card is present. We have opened the playlist
        now by default. The below code is kept just in case we have
        to revert back to close the playlist by default
      */
      if (this.hasComposedVideo) {
        this.setVisible(true);
      }
    } catch (error) {
      this.contentsLoadError = error;
    }
    this.isContentsLoading = false;
  });

  loadSessions = flow(function* (forceServer = false) {
    if (this.isSessionsLoading) return;

    if (this.isSessionsLoaded && !forceServer) return;

    this.isSessionsLoading = true;
    this.sessionsLoadError = null;
    try {
      const json = yield playlistsApi.getPlaylistContentSessions(
        this.meeting.id,
      );
      json.data.map(data => this.createOrUpdateSession(data));
      this.isSessionsLoaded = true;
    } catch (error) {
      this.sessionsLoadError = error;
    }
    this.isSessionsLoading = false;
  });

  setVisible(isVisible) {
    this.isVisible = isVisible;
  }

  get activeContent() {
    return this.contentList.find(content => content.isActive);
  }

  get hasComposedVideo() {
    return this.contentList.some(
      content => content.type === PLAYLIST_CONTENT_TYPES.composedVideo,
    );
  }

  get hasDoubtSessionCard() {
    return this.contentList.some(
      content => content.isDoubtCard,
    );
  }

  get isEmpty() {
    return this.contentList.length === 0;
  }

  get id() {
    return this._id;
  }

  get isComposedVideoContentActive() {
    return this.activeContent?.type === PLAYLIST_CONTENT_TYPES.composedVideo;
  }

  get isComposedVideoPlaying() {
    const composedVideoSession = this.isComposedVideoContentActive
      ? this.activeContent?.videoSession : null;
    return Boolean(composedVideoSession
      && composedVideoSession.isPlaying
      && !composedVideoSession.isPaused);
  }

  get isToggleEnabled() {
    return !this.hasComposedVideo;
  }

  get contentList() {
    const list = [];
    this.contents.forEach(content => {
      list.push(content);
    });
    return orderBy(list, ['order'], ['asc']);
  }

  get latestCompletedOrActiveContent() {
    const validSessions = this.sessionList.filter(
      session => session.isActive || session.isEnded,
    );
    const session = maxBy(validSessions, o => o.content && o.content.order);
    return session?.content;
  }

  get meeting() {
    return this._meeting;
  }

  get minContentOrder() {
    return min(this.contentList.map(content => content.order));
  }

  get maxContentOrder() {
    return max(this.contentList.map(content => content.order));
  }

  get sessionList() {
    const list = [];
    this.sessions.forEach(session => {
      list.push(session);
    });
    return orderBy(list, ['started_at'], ['asc']);
  }

  get skipCount() {
    return this.contentList.filter(content => content.isSkipped).length;
  }

  _createContent(data) {
    const content = PlaylistContentFactory.createInstance(this, data);
    this.contents.set(data.id, content);
  }
}

export default Playlist;
