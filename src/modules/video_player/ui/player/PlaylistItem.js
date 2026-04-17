import React, { useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { isFunction } from '@common/utils/type';
import { useActions } from '~video_player/hooks';

function PlaylistItem({
  className,
  children,
  isDefault,
  isSelected,
  onClick,
  selectedClassName,
  resumeAt,
  src,
  title,
  ...remainingProps
}) {
  const { closePlaylist, selectVideo } = useActions();

  const handleClick = useCallback((event) => {
    selectVideo(src);
    closePlaylist();

    if (onClick) {
      onClick(event);
    }
  }, [closePlaylist, onClick, selectVideo, src]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={classNames(
        'vp-playlist-item',
        { 'vp-playlist-item--selected': isSelected },
        { [className]: className },
        { [selectedClassName]: isSelected && selectedClassName },
      )}
      onClick={handleClick}
      title={title}
      {...remainingProps}
    >
      {isFunction(children) ? children({ isSelected }) : children}
    </div>
  );
}

PlaylistItem.propTypes = {
  isDefault: PropTypes.bool,
  isSelected: PropTypes.bool,
  resumeAt: PropTypes.number,
  selectedClassName: PropTypes.string,
  src: PropTypes.string.isRequired,
};

export default PlaylistItem;
