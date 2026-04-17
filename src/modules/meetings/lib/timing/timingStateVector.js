class TimingStateVector {
  // Time at which the performance clock started
  static computeOriginTimestamp() {
    return Date.now() - performance.now();
  }

  constructor({
    position = 0, velocity = 0, acceleration = 0, timestamp,
  }) {
    this._position = position;
    this._velocity = velocity;
    this._acceleration = acceleration;
    this._timestamp = timestamp; // In ms
  }

  toJSON() {
    return {
      position: this.position,
      velocity: this.velocity,
      acceleration: this.acceleration,
      timestamp: this.timestamp,
    };
  }

  get acceleration() {
    return this._acceleration;
  }

  get position() {
    return this._position;
  }

  // Return in seconds as calculated by performance.now
  get timestamp() {
    return (
      this._timestamp - TimingStateVector.computeOriginTimestamp()
    ) / 1000;
  }

  get velocity() {
    return this._velocity;
  }
}

export default TimingStateVector;
