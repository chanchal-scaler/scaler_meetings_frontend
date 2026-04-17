import React from 'react';
import classNames from 'classnames';

import { Icon } from '@common/ui/general';

function BlockedDevice({ className }) {
  return (
    <span className={classNames({ [className]: className })}>
      <Icon
        name="camera-off"
        className="danger m-h-5 h4 no-mgn-b vertical-align-tb"
      />
      <span className="bold">/</span>
      <Icon
        name="mic-off"
        className="danger m-h-5 h4 no-mgn-b vertical-align-tb"
      />
    </span>
  );
}

export default BlockedDevice;
