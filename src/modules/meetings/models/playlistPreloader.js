import {
  action, computed, makeObservable, observable,
} from 'mobx';
import camelCase from 'lodash/camelCase';
import UnsafeMediaCache from '~meetings/lib/unsafeMediaCache';

const SocketActionTypes = {
  fetchPreloadInfo: 'fetch_playlist_videos_preload_info',
};

const socketEvents = ['playlist_videos_preload_info'];

const DEFAULT_DATA = {
  can_preload: false,
  playlist_completed: false,
  videos: [],
};

class PlaylistPreloader {
  caches = new Map();

  constructor(meeting) {
    this._meeting = meeting;
    this._data = { ...DEFAULT_DATA };
    this._addEventListeners();
    makeObservable(this, {
      _data: observable,
      canPreload: computed,
      data: computed,
      isPlaylistCompleted: computed,
      setData: action,
      shouldPreload: computed,
      videos: computed,
    });
  }

  cacheNext() {
    const videoUrls = this.videos.map(o => o.url);
    videoUrls.forEach(url => this._findOrCreateCache(url));
    this.caches.forEach((cache) => {
      if (videoUrls.includes(cache.url)) {
        cache.loadMetaData();
      } else {
        cache.destroy();
      }
    });
  }

  stopCaching() {
    this.caches.forEach((cache) => cache.destroy());
  }

  destroy() {
    this.stopCaching();
    this._removeEventListeners();
  }

  fetchInfo() {
    this.socket.send(SocketActionTypes.fetchPreloadInfo, {}, 3);
  }

  setData(data) {
    this._data = data;
  }

  get data() {
    return this._data;
  }

  get isPlaylistCompleted() {
    return this.data.playlist_completed;
  }

  get manager() {
    return this.meeting.manager;
  }

  get meeting() {
    return this._meeting;
  }

  get canPreload() {
    return this.data.can_preload;
  }

  get shouldPreload() {
    return (
      this.canPreload
      && !this.isPlaylistCompleted
      && this.videos.length > 0
      && !this.videoBroadcasting.hasCDNStream
    );
  }

  get socket() {
    return this.manager.socket;
  }

  get videoBroadcasting() {
    return this.meeting.videoBroadcasting;
  }

  get videos() {
    return this.data.videos;
  }

  /* Event handlers */
  _handlePlaylistVideosPreloadInfo = (data) => {
    this.setData(data);
  }

  _addEventListeners() {
    socketEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);

      // To make sure that we never add more than one listener for every event
      this.socket.off(eventName, this[`_${handlerFnName}`]);
      this.socket.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _findOrCreateCache(url) {
    if (this.caches.has(url)) {
      return this.caches.get(url);
    } else {
      const cache = new UnsafeMediaCache(url);
      this.caches.set(url, cache);
      return cache;
    }
  }

  _removeEventListeners() {
    socketEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this.socket.off(eventName, this[`_${handlerFnName}`]);
    });
  }
}

export default PlaylistPreloader;
