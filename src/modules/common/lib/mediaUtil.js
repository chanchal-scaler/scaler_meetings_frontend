import { createDomElement } from '@common/utils/dom';

// Type can be either `audio` or `video`
const DEFAULT_OPTIONS = { type: 'video' };

class MediaUtil {
  _mediaEl = null;

  _metaDataTimeout = null;

  isLoadingMeta = false;

  constructor(src, options = {}) {
    this._src = src;
    this._options = { ...DEFAULT_OPTIONS, ...options };
  }

  destroy() {
    this._removeGhostElement();
    this._clearMetaDataTimeout();
    this.isLoadingMeta = false;
  }

  loadMetaData({ timeout }) {
    return new Promise((resolve, reject) => {
      if (this.isLoadingMeta) {
        reject(new Error(`Metadata loading is already in progress`));
      }

      this.isLoadingMeta = true;
      this._createGhostElement();
      this._metaDataTimeout = setTimeout(() => {
        this._removeGhostElement();
        this.isLoadingMeta = false;
        reject(new Error(`Metadata loading timed out after ${timeout} ms`));
      }, timeout);

      this._mediaEl.addEventListener('loadedmetadata', () => {
        this._clearMetaDataTimeout();
        this.isLoadingMeta = false;
        this._removeGhostElement();
        resolve(true);
      });

      this._mediaEl.addEventListener('error', (e) => {
        this._clearMetaDataTimeout();
        this.isLoadingMeta = false;
        this._removeGhostElement();
        reject(e);
      });

      document.body.appendChild(this._mediaEl);
    });
  }

  get src() {
    return this._src;
  }

  get options() {
    return this._options;
  }

  /* Private */

  _clearMetaDataTimeout() {
    if (this._metaDataTimeout) {
      clearTimeout(this._metaDataTimeout);
      this._metaDataTimeout = null;
    }
  }

  _createGhostElement() {
    if (!this._mediaEl) {
      const mediaEl = createDomElement(this.options.type, {
        attributes: {
          src: this.src,
          playsinline: true,
          preload: 'metadata',
        },
        styles: {
          // Not using display none because some browsers or devices don't load
          // display none videos
          opacity: 0,
          width: '1px',
          height: '1px',
          position: 'absolute',
          top: 0,
          left: 0,
        },
      });
      this._mediaEl = mediaEl;
    }
  }

  _removeGhostElement() {
    if (this._mediaEl) {
      this._mediaEl.remove();
      this._mediaEl = null;
    }
  }
}

export default MediaUtil;
