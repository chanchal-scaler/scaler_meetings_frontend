// eslint-disable-next-line
export function detectIfTouchDevice() {
  document.documentElement.classList.add('cannot-touch');

  document.addEventListener('touchstart', function addTouchClass() {
    window.__CAN_TOUCH__ = true;
    document.documentElement.classList.remove('cannot-touch');
    document.documentElement.classList.add('can-touch');
    document.removeEventListener('touchstart', addTouchClass, false);
  }, false);
}
