import React from 'react';

import useSeekbarContext from './useSeekbarContext';

function SeekbarProgress() {
  const { progress, timeToPercent } = useSeekbarContext();

  return (
    <div
      style={{ width: `${timeToPercent(progress)}%` }}
      className="vp-seekbar-progress"
    />
  );
}

export default SeekbarProgress;
