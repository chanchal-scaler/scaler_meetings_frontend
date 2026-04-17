import { reaction } from 'mobx';

import { logEvent } from '@common/utils/logger';
import { SocketStatus } from '~meetings/utils/meeting';
import TimingProviderBase, { TimingProviderStates } from './base';
import TimingStateVector from '~meetings/lib/timing/timingStateVector';

const socketStatusMap = {
  [SocketStatus.waiting]: TimingProviderStates.init,
  [SocketStatus.connecting]: TimingProviderStates.connecting,
  [SocketStatus.connecting]: TimingProviderStates.open,
  [SocketStatus.error]: TimingProviderStates.expired,
  [SocketStatus.rejected]: TimingProviderStates.expired,
  [SocketStatus.disconnected]: TimingProviderStates.disconnected,
};

const SocketActionTypes = {
  updateSession: 'update_playlist_content_session',
};

const ENABLE_SOCKET_STATE_SYNC = false;

class CDNStreamTimingProvider extends TimingProviderBase {
  static createVectorFromData(data) {
    return new TimingStateVector({
      position: data.current_time,
      velocity: data.velocity,
      timestamp: data.updated_at,
    });
  }

  static createInstance(meeting, data) {
    const vector = CDNStreamTimingProvider.createVectorFromData(data);
    const skew = TimingProviderBase.calculateSkew(data.server_time);

    return new CDNStreamTimingProvider(
      vector,
      { skew, endPosition: data.duration },
      meeting,
      data,
    );
  }

  constructor(initialVector, options, meeting, data) {
    super(initialVector, options);

    this._meeting = meeting;
    this._data = data;
    this._handleSocketStatus();
    // Temp
    this._logToSentry = this.isOwner;
  }

  destroy() {
    if (this._socketStatusReaction) {
      this._socketStatusReaction();
    }
  }

  async update({ position, velocity }) {
    if (this.isUpdating) return;

    logEvent(
      'info',
      'CDNStreamTimingProvider: Update on server',
      {
        position, velocity, skew: this.skew, sessionId: this.sessionId,
      },
    );
    this.isUpdating = true;

    const oldVector = this.vector;
    const newVector = new TimingStateVector({
      position,
      velocity,
      timestamp: this.convertToServerTs(),
    });
    this.updateVector(newVector);
    try {
      await this.socket.sendAsync(SocketActionTypes.updateSession, {
        session_id: this.sessionId,
        current_time: position,
        velocity,
      });
    } catch (error) {
      logEvent(
        'info',
        'CDNStreamTimingProvider: Update on server failed',
        {
          position, velocity, skew: this.skew, sessionId: this.sessionId,
        },
      );
      // Revert back if update fails
      this.updateVector(oldVector, true);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  updateReadyState() {
    this.setReadyState(socketStatusMap[this.manager.status]);
  }

  /**
   * Call this for to the socket event `playlist_content_session_updated` to
   * update the data in timing provider
   */
  updateWithData(data) {
    this._data = data;
    const newVector = CDNStreamTimingProvider.createVectorFromData(data);
    this.updateVector(newVector);
    this.adjustSkew(data.server_time);
  }

  get data() {
    return this._data;
  }

  get manager() {
    return this.meeting.manager;
  }

  get meeting() {
    return this._meeting;
  }

  get isOwner() {
    return this.meeting.userId === this.ownerId;
  }

  get ownerId() {
    return String(this.data.owner_id);
  }

  get sessionId() {
    return this.data.id;
  }

  get socket() {
    return this.manager.socket;
  }

  _handleSocketStatus() {
    // Disabling socket sync because the current timing object library does
    // not allow the ready state to open again after it moved to a error or
    // closed state and sometimes it is possible the socket might be
    // temporarily disconnected but after reconnecting the readyState will
    // still remain closed
    if (ENABLE_SOCKET_STATE_SYNC) {
      this._socketStatusReaction = reaction(
        () => this.manager.status,
        () => this.updateReadyState(),
        { fireImmediately: true },
      );
    } else {
      this.setReadyState(TimingProviderStates.open);
    }
  }
}

export default CDNStreamTimingProvider;
