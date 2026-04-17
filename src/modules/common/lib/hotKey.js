/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
import difference from 'lodash/difference';
import intersection from 'lodash/intersection';

// Key codes that are common on all operating systems
const keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  shift: 16,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
};

const macKeyCodes = {
  leftCmd: 91,
  cmd: 93,
  option: 18,
  control: 17,
};

// Meta -> `cmd` key on mac and `windows` key on windows
const flags = ['alt', 'ctrl', 'meta', 'shift'];

class HotKey {
  /**
   * @param {SyntheticEvent} event React synthentic event triggered for
   * the keyboard event
   */
  constructor(event) {
    this._event = event;
    this._handlers = {};
    this._init();
  }

  /* Public methods/getters */

  /**
   *
   * @param {String} hotKey
   */
  didPress(hotKey) {
    const { flags, key } = this._parseFlagsAndKey(hotKey);

    const allFlagsMatch = flags.every(flag => this.event[`${flag}Key`]);
    const keyMatches = this._findCodeForKey(key) === this.keyCode;

    return allFlagsMatch && keyMatches;
  }

  /**
   * Runs the handlers function of the matching key combination.
   * Returns a boolean indicating if any handler matched.
   */
  execute() {
    const allKeys = Object.keys(this._handlers);

    return allKeys.some(key => {
      if (this.didPress(key)) {
        this._handlers[key](this._event);
        return true;
      }

      return false;
    });
  }

  /**
   * Attaches a handler for given key combination.
   */
  on(hotKey, handler) {
    this._handlers[hotKey] = handler;
  }

  get event() {
    return this._event;
  }

  get keyCode() {
    return this.event.keyCode;
  }

  /* Private methods/getters */

  _findCodeForKey(key) {
    if (key.length === 1 && key >= 'a' && key <= 'z') {
      return key.toUpperCase().charCodeAt(0);
    } else if (this._keyCodes[key]) {
      return this._keyCodes[key];
    } else {
      throw new Error('Invalid hot key combination');
    }
  }

  // TODO Add OS specific key codes logic later and make this static method
  /**
   * Calculate key codes for the current OS. Right now only generates for
   * `macOS`
   */
  _init() {
    this._keyCodes = { ...keyCodes, ...macKeyCodes };
  }

  _parseFlags(keys) {
    return intersection(keys, flags);
  }

  _parseFlagsAndKey(hotKey) {
    const splitHotKey = hotKey.split('+');
    const flags = this._parseFlags(splitHotKey);
    const key = this._parseKey(splitHotKey);
    return { flags, key };
  }

  // Only considering first key as others don't make any sense
  _parseKey(keys) {
    return difference(keys, flags)[0];
  }
}

export default HotKey;
