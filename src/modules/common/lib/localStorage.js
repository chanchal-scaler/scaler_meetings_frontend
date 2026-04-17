const INSTANCE_VALUE_PREFIX = '$_';

/**
 * Adds a simple API for storing items in local-storage
 * Usage:
 *
 * const ls = LocalStorage.getInstance('your-unique-key');
 * ls.foo // null
 * ls.foo = 'your value';
 *
 * ls.foo // 'your value'
 *
 * @class LocalStorage
 */
class LocalStorage {
  static instance = {};

  static initializing = false;

  constructor(key) {
    if (!LocalStorage.initializing) {
      throw new Error('Use LocalStorage.getInstance instead');
    }

    this._key = key;

    this.sync();
    LocalStorage.initializing = false;
  }

  static getInstance(key) {
    if (!this.instance[key]) {
      this.initializing = true;

      try {
        this.instance[key] = new Proxy(new LocalStorage(key), {
          get(target, prop) {
            if (prop.startsWith(INSTANCE_VALUE_PREFIX)) {
              return target[prop.substring(INSTANCE_VALUE_PREFIX.length)];
            } else {
              return target._data[prop];
            }
          },
          set(target, prop, value) {
            target.addItem(prop, value);
            return true;
          },
          deleteProperty(target, prop) {
            target.removeItem(prop);
            return true;
          },
        });
      // ignoring them for know
      // eslint-disable-next-line no-empty
      } catch (e) {}
    }

    return this.instance[key];
  }

  addItem(prop, value) {
    this._data[prop] = value;
    this._saveLocalStorage();
  }

  removeItem(prop) {
    delete this._data[prop];
    this._saveLocalStorage();
  }

  sync = () => {
    this._data = this._loadLocalStorage();
  }

  _loadLocalStorage() {
    const data = window.localStorage.getItem(this._key);
    return !data ? {} : JSON.parse(data);
  }

  _saveLocalStorage() {
    window.localStorage.setItem(this._key, JSON.stringify(this._data));
  }
}

export default LocalStorage;
