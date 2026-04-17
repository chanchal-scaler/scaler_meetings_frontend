import {
  action, computed, makeObservable, observable,
} from 'mobx';
import { PLAYLIST_CONTENT_SESSION_STATUS } from '~meetings/utils/playlist';

class PlaylistContentSession {
  constructor(playlist, data) {
    this._playlist = playlist;
    this._data = data;
    makeObservable(this, {
      _data: observable.ref,
      data: computed,
      isActive: computed,
      isPlaying: computed,
      isProcessing: computed,
      isWaiting: computed,
      status: computed,
      updateData: action,
    });
  }

  updateData(newData) {
    this._data = {
      ...this._data,
      ...newData,
    };
  }

  updateStatus(newStatus) {
    this.updateData({ status: newStatus });
  }

  get content() {
    return this.playlist.contents.get(this.contentId);
  }

  get contentId() {
    return this.data.playlist_content_id;
  }

  get data() {
    return this._data;
  }

  get id() {
    return this.data.id;
  }

  get isActive() {
    return this.isWaiting || this.isProcessing || this.isPlaying;
  }

  get isEnded() {
    return this.status === PLAYLIST_CONTENT_SESSION_STATUS.ended;
  }

  get isPlaying() {
    return this.status === PLAYLIST_CONTENT_SESSION_STATUS.playing;
  }

  get isProcessing() {
    return this.status === PLAYLIST_CONTENT_SESSION_STATUS.processing;
  }

  get isWaiting() {
    return this.status === PLAYLIST_CONTENT_SESSION_STATUS.waiting;
  }

  get playlist() {
    return this._playlist;
  }

  get status() {
    return this.data.status;
  }
}

export default PlaylistContentSession;
