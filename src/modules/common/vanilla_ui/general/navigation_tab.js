const HIDDEN = 'none';

const toggleDataElement = (tabElement, activeClassLink, display) => {
  if (display === HIDDEN) {
    tabElement.classList.remove(activeClassLink);
  } else {
    tabElement.classList.add(activeClassLink);
  }
  const tabDataElementId = tabElement.dataset.dest;
  const tabDataElement = document.getElementById(tabDataElementId);
  tabDataElement.style.display = display;
};

const initialize = (config = { displayType: 'block' }) => {
  const { displayType } = config;
  const simpleLinkClass = 'navtab__link';
  const activeLinkClass = 'navtab__link--active';

  const tabs = Array.from(document.getElementsByClassName(simpleLinkClass));

  // Add event listeners
  tabs.forEach(tab => {
    tab.addEventListener('click', event => {
      tabs.forEach(el => toggleDataElement(el, activeLinkClass, HIDDEN));
      toggleDataElement(event.srcElement, activeLinkClass, displayType);
    });
  });
};

export default { initialize };
