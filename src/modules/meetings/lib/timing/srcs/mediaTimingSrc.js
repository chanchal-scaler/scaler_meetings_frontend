import clamp from 'lodash/clamp';

import TimingSrcBase from './base';

/**
 * TimingSrc implementation to be used for HTMLMediaElement's
 *
 * Example usage:
 *
 * const timingSrc = new MediaTimingSrc(mediaElement, timingObject);
 * timingSrc.connect(); // Connect and sync with timing object
 * timingSrc.disconnect(); // Disconnect from the timing object
 */
class MediaTimingSrc extends TimingSrcBase {
  _minPosition = 0;

  currentState() {
    return {
      position: this.currentPosition,
      velocity: this.currentVelocity,
      acceleration: 0,
    };
  }

  // TODO Implement logic based on sync algorithm
  _sync() {
    const { position, velocity } = this.timingObject.query();

    const _position = clamp(position, this.minPosition, this.maxPosition);
    this._updatePosition(_position);

    const normalizedVelocity = this.normalizedVelocity(
      velocity,
      this.currentPosition,
      _position,
    );
    this._updateVelocity(normalizedVelocity);
  }

  async _updateVelocity(velocity) {
    if (!this.isActing && velocity !== this.currentVelocity) {
      this.isActing = true;
      try {
        if (velocity === 0) {
          await this.timedObject.pause();
        } else {
          this.timedObject.playbackRate = velocity;
          await this.timedObject.play();
        }
      } finally {
        this.isActing = false;
      }
    }
  }

  _updatePosition(position) {
    if (!this.isTolerableDeviation(this.currentPosition, position)) {
      this.timedObject.currentTime = position;
    }
  }

  get currentVelocity() {
    return this.timedObject.paused ? 0 : this.timedObject.playbackRate;
  }

  get currentPosition() {
    return this.timedObject.currentTime;
  }

  get minPosition() {
    return this._minPosition;
  }

  get maxPosition() {
    return this.timedObject.duration;
  }
}

export default MediaTimingSrc;
