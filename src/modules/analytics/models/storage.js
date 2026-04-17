import { analyticsStorage } from '~analytics/storage/analyticsStorage';

class Storage {
/**
 * Get value from storage
 * @param {String} key - storage key
 * @param {Object} [options] - storage options
 * @return {Any}
 *
 * @example
 *
 * analytics.storage.getItem('storage_key')
 */
  // eslint-disable-next-line class-methods-use-this
  async getItem(key) {
    return analyticsStorage.getItem(key);
  }

  /**
  * Set storage value
  * @param {String} key - storage key
  * @param {any} value - storage value
  * @param {Object} [options] - storage options
  *
  * @example
  *
  * analytics.storage.setItem('storage_key', 'value')
  */
  // eslint-disable-next-line class-methods-use-this
  async setItem(key, value, options) {
    analyticsStorage.setItem(key, value, options);
  }

  /**
  * Remove storage value
  * @param {String} key - storage key
  * @param {Object} [options] - storage options
  *
  * @example
  *
  * analytics.storage.removeItem('storage_key')
  */
  // eslint-disable-next-line class-methods-use-this
  removeItem(key, options) {
    analyticsStorage.removeItem(key, options);
  }
}

export default Storage;
