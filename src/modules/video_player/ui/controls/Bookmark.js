import React, { useCallback } from 'react';
import classNames from 'classnames';

import ControlItem from '~video_player/ui/player/ControlItem';
import {
  useActions,
  useBookmarkEnabled,
  useGlobalState,
} from '~video_player/hooks';

function Bookmark({ className, ...remainingProps }) {
  const isEnabled = useBookmarkEnabled();

  const {
    addBookmark,
    pause,
  } = useActions();

  const { currentTime } = useGlobalState();

  const handleBookmarkCreate = useCallback(() => {
    if (isEnabled) {
      pause();
      addBookmark(currentTime);
    }
  }, [addBookmark, currentTime, isEnabled, pause]);

  if (isEnabled) {
    return (
      <ControlItem
        className={classNames(
          'vp-controls__control',
          { [className]: className },
        )}
        icon="bookmark-outline"
        label="Add Bookmark"
        onClick={handleBookmarkCreate}
        data-cy="video-player-controls-bookmark-button"
        {...remainingProps}
      />
    );
  } else {
    return null;
  }
}

export default Bookmark;
