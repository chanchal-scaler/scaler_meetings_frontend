import React from 'react';
import classNames from 'classnames';

import { useAudioLevel } from '~meetings/hooks';
import SoundMeter from '@common/lib/soundMeter';

const NUM_BRICKS = 8;

function AudioLevel({ className, stream }) {
  const audioLevel = useAudioLevel(stream);

  const infoUi = () => {
    if (audioLevel === 0) {
      return (
        <div className="h5 bold hint m-v-5 text-c">
          Can't see green bars filling up?
          Try changing your microphone settings.
        </div>
      );
    } else {
      return null;
    }
  };

  if (SoundMeter.isSupported()) {
    return (
      <>
        {infoUi()}
        <div
          className={classNames(
            'm-audio-level',
            { [className]: className },
          )}
        >
          {new Array(NUM_BRICKS).fill(0).map((_, index) => {
            const isActive = (index + 1) * (100 / NUM_BRICKS) <= audioLevel;
            return (
              <div
                key={index}
                className={classNames(
                  'm-audio-level__brick',
                  { 'm-audio-level__brick--active': isActive },
                )}
              />
            );
          })}
        </div>
      </>
    );
  } else {
    return null;
  }
}

export default AudioLevel;
