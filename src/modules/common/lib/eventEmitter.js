import { isFunction } from '@common/utils/type';

function throwIfNotAFunction(fn) {
  if (!isFunction(fn)) {
    throw new TypeError();
  }
}

class EventEmitter {
  constructor() {
    this._events = {};

    // To support old code or external packages
    this.addEventListener = this.on;
    this.removeEventListener = this.off;
  }

  on(type, listener) {
    throwIfNotAFunction(listener);

    const listeners = this._events[type] || (this._events[type] = []);

    if (listeners.indexOf(listener) !== -1) {
      return this;
    }

    listeners.push(listener);

    return this;
  }

  once(type, listener) {
    const eventEmitterInstance = this;
    function onceCallback(...args) {
      eventEmitterInstance.off(type, onceCallback);
      listener(...args);
    }

    return this.on(type, onceCallback);
  }

  off(type, ...args) {
    if (args.length === 0) {
      this._events[type] = null;
      return this;
    }

    const listener = args[0];
    throwIfNotAFunction(listener);
    const listeners = this._events[type];

    if (!listeners || !listeners.length) {
      return this;
    }

    const indexOfListener = listeners.indexOf(listener);
    if (indexOfListener === -1) {
      return this;
    }
    listeners.splice(indexOfListener, 1);

    return this;
  }

  emit(type, ...args) {
    const listeners = this._events[type];

    if (!listeners || !listeners.length) {
      return false;
    }

    listeners.forEach(fn => fn(...args));

    return true;
  }
}

export default EventEmitter;
