import React from 'react';
import classNames from 'classnames';

import ControlItem from '~video_player/ui/player/ControlItem';
import {
  useActions,
  useGlobalState,
} from '~video_player/hooks';

function NextVideo({ className, ...remainingProps }) {
  const { next } = useGlobalState();
  const { nextVideo } = useActions();

  if (next > -1) {
    return (
      <ControlItem
        className={classNames(
          'vp-controls__control',
          { [className]: className },
        )}
        icon="next"
        label="Next Video (N)"
        onClick={nextVideo}
        {...remainingProps}
      />
    );
  } else {
    return null;
  }
}

export default NextVideo;
