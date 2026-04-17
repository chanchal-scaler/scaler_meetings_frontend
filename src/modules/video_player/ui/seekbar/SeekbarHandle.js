import React, { useState } from 'react';
import classNames from 'classnames';

import useSeekbarContext from './useSeekbarContext';

function SeekbarHandle() {
  const [isActive, setActive] = useState(false);
  const { progress, timeToPercent } = useSeekbarContext();

  return (
    <div
      className={classNames(
        'vp-seekbar-handle',
        { 'vp-seekbar-handle--active': isActive },
      )}
      style={{ left: `${timeToPercent(progress)}%` }}
      onMouseEnter={() => setActive(true)}
      onMouseMove={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div className="vp-seekbar-handle__thumb" />
    </div>
  );
}

export default SeekbarHandle;
