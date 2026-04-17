import MediaUtil from '@common/lib/mediaUtil';

// 3 minutes timeout
const META_DATA_TIMEOUT = 3 * 60 * 1000;

const DEFAULT_OPTIONS = { type: 'video' };

/**
 * A interface that can be used to cache or preload media like videos etc.
 *
 * Why calling this unsafe?
 * Because this interface leverages some hacks and browser caching behaviour
 * to achieve caching. So there is almost no control on properties like cache
 * ttl, query param whitelisting or on demand expiry.
 *
 * When to use this?
 * - When you are sure of using the cache in the same session as it is cached
 * - When you need to preload video even before it starts playing
 */
class UnsafeMediaCache {
  static metaDataCache = new Map();

  static isMetaDataCached(url) {
    return UnsafeMediaCache.metaDataCache.has(url);
  }

  isMetaLoading = false;

  constructor(url, options) {
    this._url = url;
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._util = new MediaUtil(this._url, { type: this.options.type });
  }

  destroy() {
    this._util.destroy();
    this.isMetaLoading = false;
  }

  async loadMetaData(force = false) {
    if (this.isMetaDataCached && !force) return;

    if (this.isMetaLoading) return;

    this.isMetaLoading = true;
    try {
      await this._util.loadMetaData({ timeout: META_DATA_TIMEOUT });
    } finally {
      this.isMetaLoading = false;
    }
    UnsafeMediaCache.metaDataCache.set(this.url, true);
  }

  get isMetaDataCached() {
    return UnsafeMediaCache.isMetaDataCached(this.url);
  }

  get options() {
    return this._options;
  }

  get url() {
    return this._url;
  }
}

export default UnsafeMediaCache;
