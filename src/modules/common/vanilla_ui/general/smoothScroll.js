import { isSafari } from '@common/utils/platform';
import { scrollToElement } from '@common/utils/dom';

const smoothScrollSelector = 'a[data-action="smooth-scroll"]';

function handleLinkClick(event) {
  if (!isSafari()) {
    event.preventDefault();
  }

  const sectionId = event.target.getAttribute('href');
  const sectionEl = document.querySelector(sectionId);

  if (sectionEl) {
    scrollToElement(sectionEl);
  }
}

function initializeSmoothScroll() {
  const smoothScrollLinks = document.querySelectorAll(smoothScrollSelector);
  smoothScrollLinks.forEach(
    (el) => el.addEventListener('click', handleLinkClick),
  );
}

export default {
  initialize: initializeSmoothScroll,
};
