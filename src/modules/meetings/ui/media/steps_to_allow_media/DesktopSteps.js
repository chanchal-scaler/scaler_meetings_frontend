import React from 'react';

import {
  isChrome, isEdge, isFirefox, isOpera, isSafari,
} from '@common/utils/platform';
import BlockedDevice from './BlockedDevice';

function DesktopSteps() {
  if (isSafari()) {
    return (
      <div className="p-h-10 column">
        <div className="h5">
          1. Click on
          <span className="bold m-h-5">Safari</span>
          in the top left corner from the menu bar.
        </div>
        <div className="h5">
          2. From the dropdown menu choose
          <span className="bold m-h-5">Settings for scaler.com</span>
          .
        </div>
        <div className="h5">
          3. Set
          <span className="bold m-h-5">Camera</span>
          and
          <span className="bold m-h-5">Microphone</span>
          permissions to
          <span className="bold m-l-5">Allow</span>
          .
        </div>
      </div>
    );
  } else if (isChrome()) {
    return (
      <div className="p-h-10 column">
        <div className="h5 align-c">
          1. Click on camera/micrphone blocked icon
          <BlockedDevice />
          on the right side of address bar.
        </div>
        <div className="h5">
          2. Select "Always allow https://www.scaler.com to access your
          camera and/or microphone".
        </div>
        <div className="h5">
          3. Refresh screen to continue.
        </div>
      </div>
    );
  } else if (isFirefox()) {
    return (
      <div className="p-h-10 column">
        <div className="h5 align-c">
          1. Click on camera/micrphone blocked icon
          <BlockedDevice />
          on the top left of address bar.
        </div>
        <div className="h5">
          2. Select "Allow https://www.scaler.com to use your
          camera and/or microphone".
        </div>
        <div className="h5">
          3. Refresh screen to continue.
        </div>
      </div>
    );
  } else if (isEdge()) {
    return (
      <div className="p-h-10 column">
        <div className="h5 row align-c">
          1. Click on
          <span className="bold m-h-5">Lock</span>
          icon on the top left of address bar.
        </div>
        <div className="h5">
          2. Select "Allow" in camera and microphone dropdown.
        </div>
        <div className="h5">
          3. Refresh screen to continue.
        </div>
      </div>
    );
  } else if (isOpera()) {
    return (
      <div className="p-h-10 column">
        <div className="h5 row align-c">
          1. Click on
          <span className="bold m-h-5">Lock</span>
          icon on the top left of address bar.
        </div>
        <div className="h5">
          2. Select "Allow" in camera and microphone dropdown.
        </div>
        <div className="h5">
          3. Refresh screen to continue.
        </div>
      </div>
    );
  } else {
    return (
      <div className="p-h-10 column">
        <div className="h5 row align-c">
          Allow
          <span className="bold m-h-5">Microphone/Camera</span>
          in your browser settings.
        </div>
      </div>
    );
  }
}

export default DesktopSteps;
