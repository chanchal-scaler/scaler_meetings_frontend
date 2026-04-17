const tabActiveClass = 'tabs__item--active';
const tabTriggerActiveClass = 'tabs__trigger--active';
const tabContainerCloseClass = 'tabs--closed';

const tabCloseSelector = '.tabs__close';
const tabContainerSelector = '.tabs';
const tabSelector = '.tabs__item';
const tabTriggerSelector = '.tabs__trigger';

function registerTriggers(el) {
  const triggerEls = el.querySelectorAll(tabTriggerSelector);
  const tabEls = el.querySelectorAll(tabSelector);
  const closeEls = el.querySelectorAll(tabCloseSelector);

  function handleTabOpen() {
    triggerEls.forEach(
      triggerEl => triggerEl.classList.remove(tabTriggerActiveClass),
    );
    tabEls.forEach(tabEl => tabEl.classList.remove(tabActiveClass));

    const index = this.getAttribute('data-index');
    const tabEl = el.querySelector(
      `${tabSelector}[data-index="${index}"]`,
    );

    this.classList.add(tabTriggerActiveClass);
    tabEl.classList.add(tabActiveClass);
    el.classList.remove(tabContainerCloseClass);
  }

  function handleTabClose() {
    el.classList.add(tabContainerCloseClass);
  }

  triggerEls.forEach(
    triggerEl => triggerEl.addEventListener('click', handleTabOpen),
  );

  closeEls.forEach(
    closeEl => closeEl.addEventListener('click', handleTabClose),
  );
}

function initializeTabs() {
  const tabContainerEls = document.querySelectorAll(
    `${tabContainerSelector}[data-behaviour='tabs']`,
  );

  tabContainerEls.forEach(registerTriggers);
}

export default {
  initialize: initializeTabs,
  registerTriggers,
};
