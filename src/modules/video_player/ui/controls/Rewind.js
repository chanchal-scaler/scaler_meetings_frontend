import React from 'react';
import classNames from 'classnames';

import ControlItem from '~video_player/ui/player/ControlItem';
import { useActions } from '~video_player/hooks';
import { useMediaQuery } from '@common/hooks';

function Rewind({ className, ...remainingProps }) {
  const { mobile } = useMediaQuery();
  const { rewind } = useActions();

  if (!mobile) {
    return (
      <ControlItem
        className={classNames(
          'vp-controls__control',
          { [className]: className },
        )}
        icon="rewind"
        label="Rewind 10s (Left arrow)"
        data-cy="video-player-controls-rewind-button"
        onClick={rewind}
        {...remainingProps}
      />
    );
  } else {
    return null;
  }
}

export default Rewind;
