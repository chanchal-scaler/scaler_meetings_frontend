import {
  action, computed, flow, makeObservable, observable, reaction,
} from 'mobx';
import { TimingObject } from 'timing-object';

import { CDNStreamTimingProvider } from '~meetings/lib/timing/providers';
import { StreamContentTypes } from '~meetings/utils/stream';
import { logEvent } from '@common/utils/logger';
import { pushUnique } from '@common/utils/array';
import { randomWait } from '@common/utils/async';
import { toast } from '@common/ui/general/Toast';

const MAX_TRIES_TO_START = 2;

const PERIODIC_UPDATE_INTERVAL = 8000; // In ms

const FALLBACK_UPDATE_INTERVAL = 20000; // In ms

const RECONNECTION_CHECK_TIMEOUT = 4000; // In ms

const STREAM_RESUME_TIMEOUT = 1000; // In ms

const SocketActionTypes = {
  updateStatus: 'update_playlist_content_session_status',
};

class ComposedVideoSession {
  // Stores ids of streams of this session whose meta data has been loaded
  _metaDataLoadedStreamIds = [];

  _endedStreamIds = [];

  _metaDataFailedStreamIds = [];

  _numTriesToStart = 0;

  _isConnectionPaused = false;

  _reconnectionTimeout = null;

  playbackRate = 1;

  progress = 0;

  constructor(meeting, data) {
    this._meeting = meeting;
    this._data = data;
    this._timingProvider = CDNStreamTimingProvider.createInstance(
      meeting,
      data,
    );
    this._timingObject = new TimingObject(this._timingProvider);
    this._enablePeriodicUpdates();
    this._markUpdated();
    this._setPlaybackRate(data.velocity);
    this._addStatusChangeReaction();
    makeObservable(this, {
      _data: observable.ref,
      _isConnectionPaused: observable,
      data: computed,
      isPaused: computed,
      isPlaying: computed,
      isWaiting: computed,
      playbackRate: observable,
      processUpdate: action,
      status: computed,
      progress: observable,
      setProgress: action,
      pauseDueToConnectionLoss: action,
      resumeAfterConnectionRestored: action,
    });
  }

  destroy() {
    if (this._statusChangeReaction) this._statusChangeReaction();

    clearTimeout(this._reconnectionTimeout);
    this._reconnectionTimeout = null;
    this._isConnectionPaused = false;

    clearInterval(this._progressUpdateInterval);
    clearInterval(this._updateInterval);
    this.timingProvider.destroy();
  }

  handleConnectionStateChange(state) {
    if (this.meeting.isSuperHost) return;

    if (state === 'reconnecting') {
      // Clear any existing timeout to avoid duplicates
      clearTimeout(this._reconnectionTimeout);

      this._reconnectionTimeout = setTimeout(() => {
        const currentState = this.meeting.videoBroadcasting.connectionState;

        if (currentState === 'reconnecting' && !this._isConnectionPaused) {
          this.pauseDueToConnectionLoss();
        }

        this._reconnectionTimeout = null;
      }, RECONNECTION_CHECK_TIMEOUT);
    } else if (state === 'failed') {
      // On complete failure, pause immediately
      clearTimeout(this._reconnectionTimeout);
      this._reconnectionTimeout = null;
      if (!this._isConnectionPaused) {
        this.pauseDueToConnectionLoss();
      }
    } else if (state === 'connected') {
      // On connection restoration, resume if needed
      clearTimeout(this._reconnectionTimeout);
      this._reconnectionTimeout = null;
      if (this._isConnectionPaused) {
        this.resumeAfterConnectionRestored();
      }
    }
  }

  markStreamLoaded(streamId) {
    pushUnique(this._metaDataLoadedStreamIds, streamId);

    // If meta data is loaded or all streams start playing
    if (this._metaDataLoadedStreamIds.length === this.streamIds.length) {
      this._startPlaying();
    }
  }

  markStreamFailed(streamId) {
    pushUnique(this._metaDataFailedStreamIds, streamId);

    // End session when if any stream fails to load meta data while it is in
    // waiting state
    if (
      this._metaDataFailedStreamIds.length === 1
      && this.isWaiting
      && this.isOwner
    ) {
      this.updateStatus('failed');
    }
  }

  markStreamEnded(streamId) {
    pushUnique(this._endedStreamIds, streamId);

    // End session when first stream ends
    if (this._endedStreamIds.length === 1 && this.isOwner) {
      this.updateStatus('ended');
    }
  }

  processUpdate(data) {
    if (this._isStaleData(data)) {
      return;
    }

    // Temp logging
    if (this.isOwner) {
      logEvent(
        'info',
        'ComposedVideoSessionInfo: Processing update',
        { current: this._data, new: data },
      );
    }

    this.timingProvider.updateWithData(data);
    this._data = { ...this.data, ...data };
    this._markUpdated();
    this._setPlaybackRate(data.velocity);
  }

  pauseDueToConnectionLoss() {
    this._isConnectionPaused = true;
    this._notifyStreamsToDisconnectTimingSource();

    logEvent(
      'info',
      'ComposedVideoSession: Paused due to connection loss',
      { sessionId: this.id },
    );
  }

  resumeAfterConnectionRestored() {
    if (!this._isConnectionPaused) return;

    this._isConnectionPaused = false;

    setTimeout(() => {
      this._notifyStreamsToReconnectTimingSource();
    }, STREAM_RESUME_TIMEOUT);

    logEvent(
      'info',
      'ComposedVideoSession: Resumed after connection restored',
      { sessionId: this.id },
    );
  }

  updateStatus(newStatus) {
    this.manager.socket.send(SocketActionTypes.updateStatus, {
      session_id: this.data.id,
      status: newStatus,
    }, 3);
  }

  pause() {
    const {
      position,
    } = this.timingObject.query();

    this.timingProvider.update({
      position,
      velocity: 0,
    });

    // Temp logging
    logEvent(
      'info',
      'ComposedVideoSessionInfo: Pause action taken',
      { position },
    );
  }

  resume() {
    const {
      position,
    } = this.timingObject.query();

    this.timingProvider.update({
      position,
      velocity: this.playbackRate,
    });

    // Temp logging
    logEvent(
      'info',
      'ComposedVideoSessionInfo: Resume action taken',
      { position },
    );
  }

  seek(position) {
    const {
      velocity,
    } = this.timingObject.query();

    this.timingProvider.update({
      position,
      velocity,
    });

    // Temp logging
    logEvent(
      'info',
      'ComposedVideoSessionInfo: Seek action taken',
      { position },
    );
  }

  setProgress(newProgress) {
    this.progress = newProgress;
  }

  updatePlaybackRate = flow(function* (rate) {
    const previousRate = this.playbackRate;
    this._setPlaybackRate(rate);
    const {
      position,
      velocity,
    } = this.timingObject.query();

    // Temp logging
    logEvent(
      'info',
      'ComposedVideoSessionInfo: Update playback rate action taken',
      { position, rate },
    );

    try {
      // Only update velocity if video is currently playing else will be
      // updated when it is played
      if (velocity !== 0) {
        yield this.timingProvider.update({ position, velocity: rate });
      }
    } catch (error) {
      // Revert if update fails
      this._setPlaybackRate(previousRate);
      toast.show('Failed to update playback rate');
    }
  })

  get contentId() {
    return this.data.playlist_content_id;
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

  get videoBroadcasting() {
    return this.meeting.videoBroadcasting;
  }

  get data() {
    return this._data;
  }

  get duration() {
    return this.data.duration;
  }

  get id() {
    return this.data.id;
  }

  get isOwner() {
    return String(this.data.owner_id) === this.meeting.userId;
  }

  get isPlaying() {
    return this.status === 'playing';
  }

  get isWaiting() {
    return ['waiting', 'processing'].includes(this.status);
  }

  get status() {
    return this.data.status;
  }

  get streamIds() {
    return this.data.streams.map(o => o.uid);
  }

  get timingObject() {
    return this._timingObject;
  }

  get timingProvider() {
    return this._timingProvider;
  }

  get isPaused() {
    return this.data.velocity === 0;
  }

  _addStatusChangeReaction() {
    if (!this.meeting.isSuperHost) return;

    this._statusChangeReaction = reaction(
      () => this.status,
      (status) => {
        const isPlaying = status === 'playing';
        clearInterval(this._progressUpdateInterval);
        if (isPlaying) {
          this._progressUpdateInterval = setInterval(() => {
            // If reached almost end then stop the interval
            if (this.progress >= this.duration - 1) {
              this.setProgress(this.duration);
              clearInterval(this._progressUpdateInterval);
              return;
            }

            this._updateProgress();
          }, 1000);
        }
      },
      { fireImmediately: true },
    );
  }

  _enablePeriodicUpdates() {
    this._updateInterval = setInterval(() => {
      if (this.isOwner) {
        // Temp logging
        logEvent(
          'info',
          'ComposedVideoSessionInfo: Sending update to others',
        );
        // If owner send updates periodically
        this.messaging.sendEvent('playlist-content-session-updated', {
          ...this.data,
          server_time: this.timingProvider.convertToServerTs(),
        });
      } else if (this._isStale) {
        // Else request data if update not received for a long time
        this.manager.fetchPlaylistSessionStatus();
        this.meeting.track('playlist-session-data-stale');
      }
    }, PERIODIC_UPDATE_INTERVAL);
  }

  _isStaleData(newData) {
    if (this.data.server_time > newData.server_time) {
      logEvent(
        'info',
        'ComposedVideoSessionInfo: Stale data received with old time',
        { current: this.data, updated: newData },
      );
      return true;
    }

    if (this.status === 'playing' && newData.status === 'waiting') {
      logEvent(
        'info',
        'ComposedVideoSessionInfo: Stale data received with old status',
        { current: this.data, updated: newData },
      );
      return true;
    }

    return false;
  }

  _markUpdated() {
    this._updatedAt = Date.now();
  }

  _setPlaybackRate(rate) {
    // If new rate is zero then don't update
    if (rate !== 0) {
      this.playbackRate = rate;
    }
  }

  async _startPlaying() {
    if (this.isWaiting && this.isOwner) {
      // Temp logging
      logEvent(
        'info',
        'ComposedVideoSessionInfo: Start action taken',
        { id: this.id },
      );
      // TODO Experiment on the optimal values to make this work on 0.7mbps
      // Wait for sometime to let others also finish loading if not already
      // done
      await randomWait(1500, 3000);
      this._startPlayingImmediately();
    }
  }

  async _startPlayingImmediately() {
    // Check if still waiting and then start playing
    if (!this.isWaiting) return;

    this._numTriesToStart += 1;

    // Exhausted number of retries
    if (this._numTriesToStart > MAX_TRIES_TO_START) {
      toast.show('Failed to start. Please wait for sometime and try again!');
      // No need to do any handling to end the session has BE already ends
      // session if it does not start playing in 20s
      return;
    }

    try {
      // Temp logging
      logEvent(
        'info',
        'ComposedVideoSessionInfo: Start action executing',
        { try: this._numTriesToStart, id: this.id },
      );
      await this.timingProvider.update({ position: 0, velocity: 1 });
      this._numTriesToStart = 0;
    } catch (error) {
      this._startPlayingImmediately();
    }
  }

  _updateProgress() {
    const { position } = this.timingObject.query();
    this.setProgress(position || 0);
  }

  get _isStale() {
    return Date.now() - this._updatedAt >= FALLBACK_UPDATE_INTERVAL;
  }

  _notifyStreamsToDisconnectTimingSource() {
    this.streamIds.forEach(streamId => {
      const stream = this.meeting.videoBroadcasting.streams.get(streamId);
      if (stream && stream.contentType === StreamContentTypes.cdn) {
        if (typeof stream.disconnectTimingSource === 'function') {
          stream.disconnectTimingSource();

          // Explicitly pause the video element if it exists and is playing
          if (stream._videoEl && !stream._videoEl.paused) {
            stream._videoEl.pause();
          }
        }
      }
    });
  }

  _notifyStreamsToReconnectTimingSource() {
    this.streamIds.forEach(streamId => {
      const stream = this.meeting.videoBroadcasting.streams.get(streamId);
      if (stream && stream.contentType === StreamContentTypes.cdn) {
        if (typeof stream.reconnectTimingSource === 'function') {
          stream.reconnectTimingSource();
        }
      }
    });
  }
}

export default ComposedVideoSession;
