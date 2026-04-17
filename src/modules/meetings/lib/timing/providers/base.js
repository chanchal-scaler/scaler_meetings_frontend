import { logEvent } from '@common/utils/logger';
import { NotImplementedError } from '@common/errors';
import EventEmitter from '@common/lib/eventEmitter';

export const TimingProviderStates = {
  connecting: 'connecting',
  open: 'open',
  closed: 'closed',
  expired: 'expired',
};

/**
 * Idea from https://webtiming.github.io/timingobject/#timing-provider-object
 *
 * Used to sync timing object state between server and client
 */
class TimingProviderBase extends EventEmitter {
  static calculateSkew(currentServerTs) {
    return (currentServerTs - Date.now()) / 1000;
  }

  constructor(initialVector, { startPosition = 0, endPosition, skew = 0 }) {
    super();

    this._vector = initialVector;
    this._startPosition = startPosition;
    this._endPosition = endPosition;
    this._skew = skew; // In seconds
    this._readyState = TimingProviderStates.connecting;
  }

  adjustSkew(currentServerTs) {
    this._skew = TimingProviderBase.calculateSkew(currentServerTs);
    this.emit('adjust');
  }

  convertToServerTs(date = Date.now()) {
    const timestamp = new Date(date).getTime();
    return timestamp + (this.skew * 1000);
  }

  setReadyState(newState) {
    this._readyState = newState;
    this.emit('readystatechange');
  }

  /**
   * Implement in extending classes
   *
   * Add logic to update the vector with new values on the external server
   * when this method is called
   */
  // eslint-disable-next-line
  async update({ position, velocity, acceleration }) {
    throw new NotImplementedError('update');
  }

  /**
   * Updates vector to the received vector if it is either a newer one or if
   * `force` is specified as true
   */
  updateVector(newVector, force = false) {
    if (force || newVector.timestamp > this.vector.timestamp) {
      this._vector = newVector;
      this.emit('change');
    } else if (this._logToSentry) {
      // Temp logging
      logEvent(
        'info',
        'TimingProviderBase: Update vector is stale',
        { old: this.vector.toJSON(), new: newVector.toJSON() },
      );
    }
  }

  get endPosition() {
    return this._endPosition;
  }

  get readyState() {
    return this._readyState;
  }

  get skew() {
    return this._skew;
  }

  get startPosition() {
    return this._startPosition;
  }

  get vector() {
    return this._vector;
  }
}

export default TimingProviderBase;
