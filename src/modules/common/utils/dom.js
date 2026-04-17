import clamp from 'lodash/clamp';
import forOwn from 'lodash/forOwn';
import kebabCase from 'lodash/kebabCase';
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

export function createDomElement(tag, options = {}) {
  const el = document.createElement(tag);

  const attributes = options.attributes || {};
  forOwn(attributes, (value, name) => {
    // No need to even add attributes whose value is falsy
    if (!value) return;

    el.setAttribute(name, value);
  });

  const styles = options.styles || {};
  forOwn(styles, (value, property) => {
    el.style.setProperty(kebabCase(property), value);
  });

  return el;
}

export function getNextSibling(elem, selector) {
  let sibling = elem.nextElementSibling;

  // If there's no selector, return the first sibling
  if (!selector) return sibling;

  while (sibling) {
    if (sibling.matches(selector)) return sibling;
    sibling = sibling.nextElementSibling;
  }

  return null;
}

export function getPreviousSibling(elem, selector) {
  let sibling = elem.previousElementSibling;

  // If there's no selector, return the first sibling
  if (!selector) return sibling;

  while (sibling) {
    if (sibling.matches(selector)) return sibling;
    sibling = sibling.previousElementSibling;
  }

  return null;
}

export function getScrollHandlingEntity(el) {
  return el.tagName === 'HTML' ? window : el;
}

export function getScrollingParent(el) {
  const parentEl = el.parentElement;
  if (parentEl) {
    const { overflowY, position } = window.getComputedStyle(parentEl);
    const isScrollable = !(
      overflowY.includes('hidden')
      || overflowY.includes('visible')
    );

    if (
      position === 'fixed'
      || (isScrollable && parentEl.scrollHeight > parentEl.clientHeight)
    ) {
      return parentEl;
    }

    return getScrollingParent(parentEl);
  }

  // If none match then return the default scrolling element
  return document.scrollingElement;
}

export function isInViewport(el, offsetTop = 0) {
  const element = typeof el === 'string' ? document.querySelector(el) : el;
  if (!element) { return false; }
  const scrollEl = getScrollingParent(element);

  const elementTop = element.offsetTop;
  const elementBottom = elementTop + element.offsetHeight;

  const viewportTop = scrollEl.scrollTop;
  const viewportBottom = viewportTop + scrollEl.offsetHeight;

  return (
    elementBottom > viewportTop
    && elementTop < (viewportBottom - offsetTop)
  );
}

/**
 * Native scrollTo with callback
 * @param offset - offset to scroll to
 * @param callback - callback function
 */
export function scrollTo(
  offset,
  callback = null,
  scrollEl = document.documentElement,
  behavior = 'smooth',
) {
  const maxScrollTop = scrollEl.scrollHeight - scrollEl.offsetHeight;
  const minScrollTop = 0;
  const normalizedOffset = parseInt(
    clamp(offset, minScrollTop, maxScrollTop),
    10,
  );

  const scrollHandlingEntity = getScrollHandlingEntity(scrollEl);

  function onScroll() {
    if (parseInt(scrollEl.scrollTop, 10) === normalizedOffset) {
      scrollHandlingEntity.removeEventListener('scroll', onScroll);
      callback();
    }
  }

  if (callback) {
    scrollHandlingEntity.addEventListener('scroll', onScroll);
    onScroll();
  }

  scrollEl.scrollTo({
    top: normalizedOffset,
    behavior,
  });
}

export function scrollToElement(
  el,
  offset = 90,
  callback,
  behavior,
) {
  const scrollEl = getScrollingParent(el);
  const topPosition = el.offsetTop;
  // `90px` subtracted to account for header's
  scrollTo(topPosition - offset, callback, scrollEl, behavior);
}

export function remToPixels(rem) {
  const baseStyles = window.getComputedStyle(document.documentElement);
  return rem * parseFloat(baseStyles.fontSize);
}

/**
 * Calculate the amount of space available a specified direction after the
 * element's position
 *
 * @param {HTMLElement} el The DOM element reference
 * @param {String} direction One of top|bottom|left|right
 * @returns {Number} Space available in the give direction after the element
 */
export function calculateAvailableSpace(el, direction) {
  const rect = el.getBoundingClientRect();
  switch (direction) {
    case 'top':
      return rect.top;
    case 'bottom':
      return window.innerHeight - rect.bottom;
    case 'left':
      return rect.left;
    case 'right':
      return window.innerWidth - rect.right;
    default:
      throw new Error('Invalid direction. Pass one of top|left|right|bottom');
  }
}

export function extractStringFromHTML(htmlStr) {
  const parser = new DOMParser();
  const document = parser.parseFromString(htmlStr, 'text/html');
  return document.body.innerText;
}

export const domHeight = () => (
  Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight,
  )
);

export const domWidth = () => (
  Math.max(
    document.body.scrollWidth, document.documentElement.scrollWidth,
    document.body.offsetWidth, document.documentElement.offsetWidth,
    document.body.clientWidth, document.documentElement.clientWidth,
  )
);


export function isLastInViewportWindow(element, top, bottom) {
  const scrollEl = getScrollingParent(element);

  const elementTop = element.offsetTop;
  const elementBottom = elementTop + element.offsetHeight;

  const viewportTop = scrollEl.scrollTop + top;
  const viewportBottom = scrollEl.scrollTop + bottom;

  if (elementTop < viewportTop && elementBottom > viewportBottom) {
    return true;
  }

  if (
    elementTop > viewportTop
    && elementTop < viewportBottom
    && elementBottom > viewportBottom
  ) {
    return true;
  }

  return false;
}
