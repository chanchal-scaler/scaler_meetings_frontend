/* eslint-disable camelcase */

export function isChromium() {
  return Boolean(window.chrome);
}

export function isEdge() {
  return /edge/i.test(navigator.userAgent);
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid() {
  return /android/.test(navigator.userAgent.toLowerCase());
}

export function isMAC() {
  return navigator.platform.indexOf('Mac') > -1;
}

export function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function isOpera() {
  return typeof window.opr !== 'undefined';
}

export function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function isFirefox() {
  return /firefox/i.test(navigator.userAgent);
}

/**
 * Arc identifies itself as Chrome using similar userAgent
 * Arc has specific CSS variable --arc-palette-title
 * Note: does not work while page is still loading.
 * @returns {Boolean} True if platform is Arc Browser
 */

export function isArc() {
  return Boolean(getComputedStyle(document.documentElement)
    .getPropertyValue('--arc-palette-title'));
}

export function isChrome() {
  return isChromium() && !isOpera() && !isEdge();
}

export function isMacOS() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function getDeviceType() {
  if (/tablet|iPad/i.test(navigator.userAgent)) {
    return 'tablet';
  }
  if (isMobile()) {
    return 'mobile';
  }
  return 'desktop';
}

export function getRequestSource() {
  return window.ENV_VARS?.request_source || 'web';
}

export function isScalerAndroidApp() {
  return getRequestSource() === 'android';
}

export function isScalerIOSApp() {
  return getRequestSource() === 'ios';
}

export function isScalerMobileApp() {
  return isScalerAndroidApp() || isScalerIOSApp();
}

export function isScalerWebApp() {
  return !isScalerMobileApp();
}

export const MACOS_PRIVACY_SCREEN_CAPTURE_PREF_URL = 'x-apple.systempreferences'
  + ':com.apple.preference.security?Privacy_ScreenCapture';
