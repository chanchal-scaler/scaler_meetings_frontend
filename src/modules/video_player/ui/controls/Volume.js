import React, { useState } from 'react';
import classNames from 'classnames';

import ControlItem from '~video_player/ui/player/ControlItem';
import { Slider } from '@common/ui/general';
import { useActions, useGlobalState } from '~video_player/hooks';
import { useIsTouch } from '@common/hooks';

const levels = [
  'volume-low', 'volume-medium', 'volume-medium', 'volume-medium',
  'volume-high', 'volume-high',
];

function Volume({ className, ...remainingProps }) {
  const isTouch = useIsTouch();
  const [isChanging, setChanging] = useState(false);

  const {
    setVolume,
    toggleMute,
  } = useActions();

  const {
    isMuted,
    volume,
  } = useGlobalState();
  const level = parseInt(volume * (levels.length - 1), 10);

  function sliderUi() {
    if (!isTouch) {
      return (
        <div className="vp-volume__slider">
          <Slider
            isVertical
            label={false}
            max={1}
            min={0}
            onChangeStart={() => setChanging(true)}
            onChange={setVolume}
            onChangeEnd={() => setChanging(false)}
            step={0.01}
            value={volume}
          />
        </div>
      );
    } else {
      return null;
    }
  }

  function controlUi() {
    return (
      <ControlItem
        icon={isMuted ? 'volume-off' : levels[level]}
        label="Mute (M)"
        onClick={toggleMute}
        data-cy="video-player-controls-volume-button"
        placement="left"
        {...remainingProps}
      />
    );
  }

  return (
    <div
      className={classNames(
        'vp-controls__control vp-volume',
        { 'vp-volume--active': isChanging },
        { [className]: className },
      )}
    >
      {controlUi()}
      {sliderUi()}
    </div>
  );
}

export default Volume;
