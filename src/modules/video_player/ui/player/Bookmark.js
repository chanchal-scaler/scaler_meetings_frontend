import React, { useCallback } from 'react';
import classNames from 'classnames';

import { useActions, useGlobalState } from '~video_player/hooks';

function Bookmark({
  canEdit,
  className,
  inputClassName,
  slug,
  time,
  title,
}) {
  const { editBookmark, play, setSeekTo } = useActions();
  const { duration } = useGlobalState();

  const handleSeek = useCallback(() => {
    setSeekTo(time);
    play();
  }, [play, setSeekTo, time]);

  const handleShow = useCallback(() => {
    editBookmark({
      canEdit,
      slug,
      time,
      title,
      inputClassName,
    });
  }, [canEdit, editBookmark, inputClassName, slug, time, title]);

  const handleHide = useCallback(() => {
    editBookmark(null);
  }, [editBookmark]);

  if (time < duration) {
    return (
      // eslint-disable-next-line
      <span
        className={classNames(
          'vp-bookmark',
          { [className]: className },
        )}
        onClick={handleSeek}
        onMouseEnter={handleShow}
        onMouseLeave={handleHide}
        role="button"
        style={{
          left: `${(time * 100) / duration}%`,
        }}
      />
    );
  } else {
    return null;
  }
}

export default Bookmark;
