import { isIOS, isSafari } from '@common/utils/platform';
import { isNullOrUndefined } from '@common/utils/type';

let visibilityProperty;

if (!isNullOrUndefined(document.hidden)) {
  visibilityProperty = 'hidden';
} else if (!isNullOrUndefined(document.msHidden)) {
  visibilityProperty = 'msHidden';
} else if (!isNullOrUndefined(document.webkitHidden)) {
  visibilityProperty = 'webkitHidden';
}


export const isPushNotificationSupported = (
  'Notification' in window
  && 'serviceWorker' in navigator
  && 'PushManager' in window
);

export function isWindowHidden() {
  return (
    !visibilityProperty
    || (visibilityProperty && document[visibilityProperty])
  );
}
export async function enterFullscreen(element = document.documentElement) {
  try {
    if (isIOS()) { /* Safari on iOS does not support div/container fullscreen */
      await element.webkitEnterFullscreen();
    } else if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { /* Firefox */
      await element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      await element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE/Edge */
      await element.msRequestFullscreen();
    }
  } catch (e) {
    // Ignore error
  }
}

export async function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      await document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      await document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      await document.msExitFullscreen();
    }
  } catch (error) {
    // Ignore error
  }
}

export function getPosition(element) {
  let xPosition = 0;
  let yPosition = 0;

  while (element) {
    xPosition += (element.offsetLeft + element.clientLeft);
    yPosition += (element.offsetTop + element.clientTop);
    // eslint-disable-next-line no-param-reassign
    element = element.offsetParent;
  }
  return {
    x: (xPosition
      - (document.documentElement.scrollLeft || document.body.scrollLeft)),
    y: (yPosition
      - (document.documentElement.scrollTop || document.body.scrollTop)),
  };
}

export function scrollToRef(ref) {
  if (isSafari() || isIOS()) {
    // the scrollIntoView with options is not available in Safari and IOS
    ref.current.scrollIntoView();
  } else {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }
}
