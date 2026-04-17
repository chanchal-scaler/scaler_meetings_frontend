import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import camelCase from 'lodash/camelCase';

import { PlaybackStates } from '~meetings/utils/playback';
import { toast } from '@common/ui/general/Toast';
import playbackApi from '~meetings/api/playback';

const ServerActionTypes = {
  statusChanged: 'playback_status_changed',
  load: 'fetch_playback',
  save: 'save_playback',
};

const PlaybackActions = {
  togglePlaying: 'toggle_playing',
  toggleMute: 'toggle_mute',
  seeked: 'seeked',
  toggleVisibility: 'toggle_visibility',
  changeRate: 'change_rate',
};

const socketEvents = [
  'current_playback', 'playback_status', 'playback_started', 'playback_ended',
];

class Playback {
  isCreateModalOpen = false;

  isLoading = false;

  loadError = null;

  id = null;

  videoUrl = null;

  // Id of the user who started the playback
  ownerId = null;

  currentTime = 0;

  localCurrentTime = 0;

  state = PlaybackStates.paused;

  rate = 1;

  isMuted = false;

  onTop = false;

  updatedAt = null;

  isSeeked = false;

  lastControllerId = null;

  muted = false;

  constructor(meeting) {
    this._meeting = meeting;

    this._addEventListeners();
    this.load();
    makeObservable(this, {
      canToggleVisibility: computed,
      currentTime: observable,
      isActive: computed,
      isAdded: computed,
      isCreateModalOpen: observable,
      id: observable,
      isLoading: observable,
      isMuted: observable,
      isOwner: computed,
      isSeeked: observable,
      isUserController: computed,
      isVisibleToAll: computed,
      lastControllerId: observable,
      muted: observable,
      onTop: observable,
      owner: computed,
      ownerId: observable,
      rate: observable,
      reset: action,
      setCreateModalOpen: action,
      setLastController: action,
      setSeeked: action,
      setVideo: action,
      state: observable,
      togglePlaying: action,
      toggleMute: action,
      videoUrl: observable,
    });
  }

  /* Public methods/getters */

  add = flow(function* (url) {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      const json = yield playbackApi.create(
        this.meeting.slug,
        {
          playback: {
            video_url: url,
          },
        },
      );
      this.setVideo(json.playback);
      this.setLastController(this.meeting.userId);
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  });

  destroy() {
    this._removeEventListeners();
  }

  load() {
    this.socket.send(ServerActionTypes.load, {}, 2);
  }

  remove = flow(function* () {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      yield playbackApi.delete(this.meeting.slug);
      this.reset();
      toast.show({
        message: 'Video has been removed',
        type: 'info',
      });
    } catch (error) {
      toast.show({
        message: 'Failed to remove video',
        type: 'error',
      });
    }
    this.isLoading = false;
  });

  saveProgress() {
    const data = this._createPayload();

    if (this.meeting.isSuperHost) {
      this.socket.send(ServerActionTypes.save, { data });
    }

    if (this.isOwner) {
      this.messaging.sendEvent('playback-update', { data });
    }
  }

  /* Methods that are used to update data from server to client */

  setVideo(data) {
    this.id = data.id;
    this.videoUrl = data.video_url;
    this.ownerId = data.user_id;
    this.setStatus(data);
  }

  setSeeked(isSeeked) {
    this.isSeeked = isSeeked;
  }

  setStatus(data) {
    this.currentTime = data.current_time;
    this.state = data.state;
    this.rate = data.rate || 1;
    this.isMuted = data.muted;
    this.onTop = data.on_top || false;
    this.updatedAt = new Date(data.updated_at).getTime();
  }

  reset() {
    this.id = null;
    this.videoUrl = 0;
    this.ownerId = null;
    this.currentTime = 0;
    this.localCurrentTime = 0;
    this.state = PlaybackStates.paused;
    this.rate = 1;
    this.isMuted = false;
    this.updatedAt = null;
  }

  setCreateModalOpen(isOpen) {
    this.isCreateModalOpen = isOpen;
  }

  setLastController(userId) {
    this.lastControllerId = userId;
  }

  /* Methods that are used to update data from video element to mobx state */

  bringToTop(onTop) {
    if (this.onTop === onTop) {
      return;
    }

    this.onTop = onTop;
    this._emitStatusChange(PlaybackActions.toggleVisibility);
  }

  changeRate(rate) {
    if (rate === this.rate) {
      return;
    }

    this.rate = rate;
    this._emitStatusChange(PlaybackActions.changeRate);
  }

  setLocalCurrentTime(currentTime) {
    this.localCurrentTime = currentTime;
  }

  togglePlaying(isPlaying = false) {
    const newState = isPlaying ? PlaybackStates.playing : PlaybackStates.paused;
    if (newState === this.state) {
      return;
    }

    this.state = newState;
    this._emitStatusChange(PlaybackActions.togglePlaying);
  }

  toggleMute(isMuted = false) {
    if (isMuted === this.isMuted) {
      return;
    }

    this.isMuted = isMuted;
    this._emitStatusChange(PlaybackActions.toggleMute);
  }

  seeked() {
    this._emitStatusChange(PlaybackActions.seeked);
  }

  get canToggleVisibility() {
    const numStreams = this.videoBroadcasting.streamsList.length;
    return numStreams > 0;
  }

  get isActive() {
    return this.state === PlaybackStates.playing;
  }

  get isAdded() {
    return Boolean(this.videoUrl);
  }

  get isOwner() {
    return String(this.ownerId) === this.meeting.userId;
  }

  get isUserController() {
    return this.meeting.userId === String(this.lastControllerId);
  }

  get isVisibleToAll() {
    return (
      this.isActive
      || this.onTop
      || !this.canToggleVisibility
    );
  }

  get manager() {
    return this.meeting.manager;
  }

  get meeting() {
    return this._meeting;
  }

  get messaging() {
    return this.meeting.messaging;
  }

  get owner() {
    if (this.ownerId) {
      return this.meeting.getParticipant(this.ownerId);
    } else {
      return null;
    }
  }

  get socket() {
    return this.manager.socket;
  }

  get videoBroadcasting() {
    return this.meeting.videoBroadcasting;
  }

  /* Event handlers */

  _handleCurrentPlayback = ({ data }) => {
    if (data) {
      this.setVideo(data);
      this.setLastController(data.user_id);
    } else {
      this.reset();
    }
  }

  _handlePlaybackStarted = ({ data }) => {
    this.setVideo(data);
    this.setLastController(data.user_id);
  }

  _handlePlaybackStatus = ({ data, user_id: userId, type }) => {
    // Status changed caused by current user
    if (userId === this.meeting.userId) {
      return;
    }

    // Received packed is stale
    if (
      this.updatedAt
      && this.updatedAt > new Date(data.updated_at).getTime()
    ) {
      return;
    }

    this.setLastController(userId);
    this.setVideo(data);
    if (type === PlaybackActions.seeked) {
      this.setSeeked(true);
    }
  }

  _handlePlaybackEnded = ({ data }) => {
    if (this.id === data.id) {
      this.reset();
    }
  }

  /* Private methods/getters */

  _addEventListeners() {
    socketEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);

      // To make sure that we never add more than one listener for every event
      this.socket.off(eventName, this[`_${handlerFnName}`]);
      this.socket.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _createPayload() {
    return {
      id: this.id,
      video_url: this.videoUrl,
      user_id: this.ownerId,
      state: this.state,
      rate: this.rate,
      muted: this.isMuted,
      on_top: this.onTop,
      current_time: this.localCurrentTime,
    };
  }

  _emitStatusChange(type) {
    if (!this.meeting.isSuperHost) {
      return;
    }

    const payload = {
      type,
      data: this._createPayload(),
      // ID of user who changed the playback. Can be different from owner id
      // if the video is being controlled by another `super_host`
      user_id: this.meeting.userId,
    };
    this.setLastController(this.meeting.userId);
    this.socket.send(ServerActionTypes.statusChanged, payload, 3);
  }

  _removeEventListeners() {
    socketEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this.socket.off(eventName, this[`_${handlerFnName}`]);
    });
  }
}

export default Playback;
