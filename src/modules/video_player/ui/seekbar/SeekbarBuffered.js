import React from 'react';

import { useGlobalState } from '~video_player/hooks';
import { timeRangeToArray } from '@common/utils/dataTransformers';
import useSeekbarContext from './useSeekbarContext';

function SeekbarBuffered() {
  const { timeToPercent } = useSeekbarContext();
  const { bufferedIntervals } = useGlobalState();

  function intervalUi({ start, end }, index) {
    return (
      <div
        key={index}
        className="vp-seekbar-buffered__interval"
        style={{
          left: `${timeToPercent(start)}%`,
          width: `${timeToPercent(end - start)}%`,
        }}
      />
    );
  }

  if (bufferedIntervals) {
    const intervals = timeRangeToArray(bufferedIntervals);
    return (
      <div className="vp-seekbar-buffered">
        {intervals.map(intervalUi)}
      </div>
    );
  } else {
    return null;
  }
}

export default SeekbarBuffered;
