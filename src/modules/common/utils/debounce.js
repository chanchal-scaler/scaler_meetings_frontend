export default function (fn, wait, immediate) {
  let timeout;
  return function () {
    const ctx = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) fn.apply(ctx, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) fn.apply(ctx, args);
  };
}
