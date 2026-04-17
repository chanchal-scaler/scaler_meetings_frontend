import React from 'react';
import classNames from 'classnames';

import ControlItem from '~video_player/ui/player/ControlItem';
import { useActions } from '~video_player/hooks';
import { useMediaQuery } from '@common/hooks';

function Forward({ className, ...remainingProps }) {
  const { mobile } = useMediaQuery();
  const { forward } = useActions();

  if (!mobile) {
    return (
      <ControlItem
        className={classNames(
          'vp-controls__control',
          { [className]: className },
        )}
        icon="forward"
        label="Forward 10s (Right arrow)"
        data-cy="video-player-controls-forward-button"
        onClick={forward}
        {...remainingProps}
      />
    );
  } else {
    return null;
  }
}

export default Forward;
