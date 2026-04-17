import { NotImplementedError } from '@common/errors';

export const TimingSyncAlgorithms = {
  /**
   * When underling object is out of sync with the timing object for more than
   * tolerable amount then try to gradually sync by increasing velocity if
   * the deviation is within some threshold else sync instantly
   */
  gradual: 'gradual',
  /**
   * When underling object is out of sync with the timing object for more than
   * tolerable amount then sync instantly
   */
  instant: 'instant',
};


/**
 * Concept inspired from the following draft:
 * https://webtiming.github.io/timingobject/
 *
 * The above page describes a clean way to handle syncing timing based content
 * across multiple devices
 *
 * Note: Do not use this class directly
 */
class TimingSrcBase {
  static defaultOptions = {
    pollFrequency: 250,
    tolerence: 1,
    syncAlgorithm: TimingSyncAlgorithms.instant,
    syncOptions: {
      threshold: 4, // Valid for `gradual` only
      velocityFactor: 0.2, // Valid for `gradual` only
    },
  };

  _pollIntervalId = null;

  constructor(timedObject, timingObject, options = {}) {
    this._timedObject = timedObject;
    this._timingObject = timingObject;
    this._options = { ...this.constructor.defaultOptions, ...options };
  }

  connect() {
    this.disconnect();

    // Sync once immediately
    this._sync();
    this._pollIntervalId = setInterval(
      () => this._sync(),
      this.options.pollFrequency,
    );
  }

  /**
   * Implement in extending classes
   *
   * Should return the current state of underlying timed object. Returns a
   * object whose structure is same as the return value for `query` method in
   * TimingObject class
   */
  // eslint-disable-next-line class-methods-use-this
  currentState() {
    throw new NotImplementedError('currentState');
  }

  disconnect() {
    clearInterval(this._pollIntervalId);
  }

  isTolerableDeviation(current, expected) {
    let { tolerence } = this.options;
    if (this.options.syncAlgorithm === TimingSyncAlgorithms.gradual) {
      tolerence = this.syncThreshold;
    }
    return Math.abs(current - expected) <= tolerence;
  }

  /**
   * Returns velocity after considering syncing algorithm
   */
  normalizedVelocity(velocity, currentPosition, expectedPosition) {
    if (this.shouldSyncGradually(currentPosition, expectedPosition)) {
      // Divide by zero does not occur because this code will only run when
      // expected and current positions are different
      const multiplier = (
        (expectedPosition - currentPosition)
        / Math.abs(expectedPosition - currentPosition)
      );
      return velocity * (1 + multiplier * this.syncVelocityFactor);
    } else {
      return velocity;
    }
  }

  shouldSyncGradually(current, expected) {
    const outOfSync = Math.abs(current - expected);
    return (
      this.options.syncAlgorithm === TimingSyncAlgorithms.gradual
      && outOfSync >= this.options.tolerence
      && outOfSync <= this.syncThreshold
    );
  }

  /**
   * Implement in extending classes
   *
   * Should contain the logic to sync the timedObject with timingObject
   */
  // eslint-disable-next-line class-methods-use-this
  _sync() {
    throw new NotImplementedError('_sync');
  }

  get timedObject() {
    return this._timedObject;
  }

  get timingObject() {
    return this._timingObject;
  }

  get options() {
    return this._options;
  }

  get syncThreshold() {
    return this.options.syncOptions.threshold;
  }

  get syncVelocityFactor() {
    return this.options.syncOptions.velocityFactor;
  }
}

export default TimingSrcBase;
