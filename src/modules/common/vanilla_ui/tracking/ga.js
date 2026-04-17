function initializeGaTracking(defaultCategory) {
  function handleTrackableAction(el, eventType) {
    // Only track if ga is initialized in the page
    if (window.trackGaEvent) {
      const category = el.getAttribute('data-ga-category') || defaultCategory;
      const action = el.getAttribute('data-ga-action');
      const label = el.getAttribute('data-ga-label');

      window.trackGaEvent(category, `${action}-${eventType}`, label);
    }
  }

  const buttonEls = document.querySelectorAll(`[data-tracking="ga"]`);

  buttonEls.forEach(el => {
    const actionsToTrack = el.getAttribute('data-ga-actions') || 'click';
    const actions = actionsToTrack.split(',');
    actions.forEach(action => {
      el.addEventListener(action, () => handleTrackableAction(el, action));
    });
  });

  window.addEventListener('beforeunload', () => {
    const minutesSpent = parseInt(window.performance.now() / (1000 * 60), 10);
    const userId = window.__CURRENT_USER__
      ? window.__CURRENT_USER__.slug
      : '-1';
    window.trackGaEvent(
      'time_spent_on_page',
      window.location.pathname,
      minutesSpent,
      userId,
    );
  });
}

export default {
  initialize: initializeGaTracking,
};
