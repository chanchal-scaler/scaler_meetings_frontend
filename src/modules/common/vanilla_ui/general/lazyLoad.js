const defaultConfig = {
  root: null,
  rootMargin: '60px',
  threshold: 0,
};
const noop = () => {};

/**
 * Expects arguments
 * selector: the element selector to be lazy loaded
 * config: compatible with `IntersectionObserver` api
 * callback: function to be called on the various action
 */
class LazyLoad {
  constructor({
    selector = 'lazy-elem',
    config = {},
    callback = noop,
  }) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    this.selector = selector;
    this._callback = callback;
    this.observer = this._observer();
    this._initialize();
  }

  _observer() {
    return new IntersectionObserver(
      (entries) => this._observerCallback(entries),
      this.config,
    );
  }

  _observerCallback(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this._callback.apply(this, [entry]);
      }
    });
  }

  _initialize() {
    const elems = document.querySelectorAll(`.${this.selector}`);
    elems.forEach(elem => this.observer.observe(elem));
  }
}

export default LazyLoad;
