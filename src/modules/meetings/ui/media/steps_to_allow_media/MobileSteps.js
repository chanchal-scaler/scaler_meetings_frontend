import React from 'react';

import {
  isAndroid, isChrome, isFirefox, isIOS, isSafari,
} from '@common/utils/platform';

export default function MobileSteps() {
  if (isIOS() && isSafari()) {
    return (
      <div className="p-h-10 column">
        <div className="h5">
          1. Open
          <span className="bold m-h-5">Settings</span>
          and navigate to
          <span className="bold m-l-5">Safari</span>
          .
        </div>
        <div className="h5">
          2. Scroll down to section named
          <span className="bold m-l-5">SETTINGS FOR WEBSITES</span>
          .
        </div>
        <div className="h5">
          3. Allow
          <span className="bold m-h-5">Camera</span>
          and
          <span className="bold m-h-5">Microphone</span>
          access.
        </div>
        <div className="h5">
          3. Reload this page.
        </div>
      </div>
    );
  } else if (isIOS() && isChrome()) {
    return (
      <div className="p-h-10 column">
        <div className="h5">
          1. Open
          <span className="bold m-h-5">Settings</span>
          and navigate to
          <span className="bold m-l-5">Chrome</span>
          .
        </div>
        <div className="h5">
          3. Allow
          <span className="bold m-h-5">Camera</span>
          and
          <span className="bold m-h-5">Microphone</span>
          access.
        </div>
        <div className="h5">
          3. Reload this page.
        </div>
      </div>
    );
  } else if (isIOS() && isFirefox()) {
    return (
      <div className="p-h-10 column">
        <div className="h5">
          1. Open
          <span className="bold m-h-5">Settings</span>
          and navigate to
          <span className="bold m-l-5">Firefox</span>
          .
        </div>
        <div className="h5">
          3. Allow
          <span className="bold m-h-5">Camera</span>
          and
          <span className="bold m-h-5">Microphone</span>
          access.
        </div>
        <div className="h5">
          3. Reload this page.
        </div>
      </div>
    );
  } else if (isAndroid() && isChrome()) {
    return (
      <div className="p-h-10 column">
        <div className="h5">
          1. To the right of the address bar, tap More (triple dots)
          then tap on
          <span className="bold m-l-5">Settings</span>
          .
        </div>
        <div className="h5">
          2. Tap
          <span className="bold m-l-5">Site Settings</span>
          .
        </div>
        <div className="h5">
          3. Tap
          <span className="bold m-h-5">Microphone</span>
          or
          <span className="bold m-h-5">Camera</span>
          .
        </div>
        <div className="h5">
          4. Tap to turn the microphone or camera on or off.
        </div>
        <div className="h5">
          5. Look for
          <span className="bold m-h-5">scaler.com</span>
          under the Blocked list. If you see it BLOCKED, tap
          <span className="bold m-l-5">
            scaler.com
            {' > '}
            Access your camera
            {' > '}
            Allow..
          </span>
        </div>
        <div className="h5">
          6. Reload this page.
        </div>
      </div>
    );
  } else if (isAndroid() && isFirefox()) {
    return (
      <div className="p-h-10 column">
        <div className="h5">
          1. To the right of the address bar, tap More (triple dots)
          then tap on
          <span className="bold m-l-5">Settings</span>
          .
        </div>
        <div className="h5">
          2. Tap
          <span className="bold m-l-5">Privacy and Secruity</span>
          .
        </div>
        <div className="h5">
          3. Tap
          <span className="bold m-h-5">Microphone</span>
          or
          <span className="bold m-h-5">Camera</span>
          .
        </div>
        <div className="h5">
          4. Tap on
          <span className="bold m-h-5">Allow</span>
          for
          <span className="bold m-h-5">Camera</span>
          or
          <span className="bold m-h-5">Microphone</span>
          to toggle the permissions for microphone or camera.
        </div>
        <div className="h5">
          5. Reload this page.
        </div>
      </div>
    );
  } else {
    return (
      <div className="p-h-10 column">
        <div className="h5">
          Check your device settings for camera and microphone permissions
          for this browser.
        </div>
      </div>
    );
  }
}
