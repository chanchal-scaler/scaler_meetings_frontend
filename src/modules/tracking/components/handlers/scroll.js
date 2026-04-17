// Stub: the @tracking app is not part of this repository.
// These no-op implementations prevent runtime errors in GTM scroll tracking code.

export function trackScrollHandler() {
  return () => {};
}

export function setupIntersectionObserver(root) {
  return new IntersectionObserver(() => {}, { root });
}
