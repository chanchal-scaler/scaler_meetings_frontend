import throttle from 'lodash/throttle';

const fabClass = 'f-action';
const fabActiveClass = 'f-action--active';

function currentScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop;
}

// Assuming that a page will have atmost one floating action button
function initializeFab() {
  const fabEl = document.querySelector(`.${fabClass}`);

  if (!fabEl) return;

  const targetId = fabEl.getAttribute('data-target');
  const targetEl = document.getElementById(targetId);

  let lastScrollTop = currentScrollTop();
  let fabTimeout = null;

  function showFab() {
    fabTimeout = setTimeout(() => {
      fabEl.classList.add(fabActiveClass);
    }, 300);
  }

  function hideFab() {
    clearTimeout(fabTimeout);
    fabEl.classList.remove(fabActiveClass);
  }

  function onScrollUp() {
    if (!fabTimeout) {
      showFab();
    }
  }

  function onScrollDown() {
    hideFab();
    showFab();
  }

  function getTargetHeight() {
    // target height is basically the height
    // after which the FAB should be shown
    if (targetEl) {
      // if targetEl is present, show fab after it goes out of screen
      return (
        window.pageYOffset
        + targetEl.getBoundingClientRect().top
        + targetEl.offsetHeight
      );
    } else {
      // if no target element, show fab after the window height
      return window.innerHeight;
    }
  }
  function onScroll() {
    const newScrollTop = currentScrollTop();
    const targetHeight = getTargetHeight();

    // Don't fab show untill banner section is completely out of screen
    if (newScrollTop < targetHeight) {
      hideFab();
    } else if (newScrollTop > lastScrollTop) {
      // Scrolled down
      onScrollDown();
    } else if (newScrollTop < lastScrollTop) {
      // Scrolled up
      onScrollUp();
    } else {
      // Didn't scroll don't do anything
      // Practially very rare case
    }

    lastScrollTop = newScrollTop;
  }

  const onScrollThrottled = throttle(onScroll, 300);

  window.addEventListener('scroll', onScrollThrottled);
}

export default {
  initialize: initializeFab,
};
