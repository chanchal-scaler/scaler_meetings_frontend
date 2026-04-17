export function copyToClipboard(str) {
  const { document } = window;
  const dummyInput = document.createElement('input');
  document.body.appendChild(dummyInput);
  dummyInput.value = str;
  dummyInput.select();
  document.execCommand('copy');
  document.body.removeChild(dummyInput);
}

/**
 * A standard UUID generator function.
 * Picked from https://stackoverflow.com/a/8809472
 */
export function generateUUID() {
  let d = Date.now();
  // Time in microseconds since page-load or 0 if unsupported
  let d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      // eslint-disable-next-line no-bitwise
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      // eslint-disable-next-line no-bitwise
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    // eslint-disable-next-line
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/**
 * Checks whether a user is logged in ot not.
 * If the user is available, returns the id of the user.
 * @returns {string|undefined}
 */
export function isUserLoggedIn() {
  const meta = document.querySelector('meta[name=\'current-user\']');
  return meta?.getAttribute('data-id');
}
