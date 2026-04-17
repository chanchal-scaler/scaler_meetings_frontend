const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '0px',
  threshold: 0.05,
};

function pushSectionViewToGTM(sectionId) {
    window?.GTMtracker.pushEvent({
      event: 'gtm_section_view',
      data: {
        section_name: sectionId,
      },
      action: 'section_view',
    });
}

function initializeObserver(observerConfig) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        pushSectionViewToGTM(entry.target.id);
      }
    });
  }, observerConfig);


  return observer;
}


function trackSectionView(
  sectionIds = [], observerConfig = OBSERVER_OPTIONS,
) {
  const observer = initializeObserver(observerConfig);
  sectionIds.forEach((sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      observer.observe(sectionElement);
    }
  });
}

export default {
  initialize: trackSectionView,
};
