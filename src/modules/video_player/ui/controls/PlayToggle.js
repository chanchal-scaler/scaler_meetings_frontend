import React from 'react';
import classNames from 'classnames';

import ControlItem from '~video_player/ui/player/ControlItem';
import {
  useActions,
  useGlobalState,
} from '~video_player/hooks';

function PlayToggle({ className, ...remainingProps }) {
  const { isPlaying } = useGlobalState();
  const { togglePlay } = useActions();

  return (
    <ControlItem
      className={classNames(
        'vp-controls__control',
        { [className]: className },
      )}
      data-cy="video-player-play-toggle"
      icon={isPlaying ? 'pause' : 'play'}
      label="Play/Pause (Space)"
      onClick={togglePlay}
      {...remainingProps}
    />
  );
}

export default PlayToggle;
