import LazyLoad from './lazyLoad';

function initializeLazyLoadImages() {
  new LazyLoad({
    callback(entry) {
      const { target } = entry;
      target.src = target.dataset.src;
      target.classList.remove(this.selector);
      this.observer.unobserve(target);
    },
  });
}

export default { initialize: initializeLazyLoadImages };
