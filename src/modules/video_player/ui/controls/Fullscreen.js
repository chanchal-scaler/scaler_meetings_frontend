import React from 'react';
import classNames from 'classnames';

import ControlItem from '~video_player/ui/player/ControlItem';
import {
  useFullScreen,
  useGlobalState,
} from '~video_player/hooks';

function Fullscreen({ className, ...remainingProps }) {
  const { isFullscreen } = useGlobalState();
  const handleFullScreen = useFullScreen();

  return (
    <ControlItem
      className={classNames(
        'vp-controls__control',
        { [className]: className },
      )}
      icon={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
      label="Toggle fullscreen (F)"
      data-cy="video-player-controls-fullscreen-button"
      onClick={handleFullScreen}
      {...remainingProps}
    />
  );
}

export default Fullscreen;
