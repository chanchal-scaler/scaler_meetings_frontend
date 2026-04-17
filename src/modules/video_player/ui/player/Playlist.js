import React, { Children, cloneElement, useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Icon, Tappable } from '@common/ui/general';
import { useDelayUnmount } from '@common/hooks';
import {
  useActions,
  useControlsFallback,
  useGlobalState,
} from '~video_player/hooks';
import * as CustomPropTypes from '@common/utils/propTypes';

function Playlist({
  children, className, defaultOpen = true, playlistOpenDelay = 0, ...remainingProps
}) {
  const { currentSrc, isPlaylistOpen } = useGlobalState();

  const { setPlaylist, closePlaylist, openPlaylist } = useActions();

  const showPlaylist = useDelayUnmount(isPlaylistOpen, 180);

  const isFallback = useControlsFallback();

  useEffect(() => {
    let selected = 0;
    const playlist = [];

    Children.forEach(children, (child, index) => {
      const {
        isDefault, resumeAt, src, title,
      } = child.props;

      if (isDefault) {
        selected = index;
      }

      playlist.push({ resumeAt, src, title });
    });

    const _playlistOpenDelay = setTimeout(() => {
      // default open playlist for better UX
      if (playlist.length > 1 && defaultOpen) {
        openPlaylist();
      }
    }, playlistOpenDelay);

    setPlaylist(playlist, selected);

    return () => clearTimeout(_playlistOpenDelay);
    // eslint-disable-next-line
  }, []);

  function itemUi(child) {
    // eslint-disable-next-line no-unused-vars
    const { isDefault, src } = child.props;
    const isSelected = currentSrc === src;

    const propsToInject = {
      isSelected,
    };

    return cloneElement(child, propsToInject);
  }

  if (showPlaylist) {
    return (
      <>
        { /* eslint-disable-next-line */}
        <div
          className={classNames(
            'vp-playlist-backdrop',
            { 'vp-playlist-backdrop--fallback': isFallback },
            { [className]: className },
          )}
          onClick={closePlaylist}
        />
        <div
          className={classNames(
            'vp-playlist layout',
            { 'vp-playlist--hidden': !isPlaylistOpen },
            { 'vp-playlist--fallback': isFallback },
            { [className]: className },
          )}
          {...remainingProps}
        >
          <div className="vp-playlist__header layout__header">
            <div className="vp-playlist__title">
              Playlist
            </div>
            <div className="vp-playlist__actions">
              <Tappable
                className="btn btn-icon"
                onClick={closePlaylist}
              >
                <Icon name="clear" />
              </Tappable>
            </div>
          </div>
          <div className="vp-playlist__items layout__content">
            {Children.map(children, itemUi)}
          </div>
        </div>
      </>
    );
  } else {
    return null;
  }
}

Playlist.propTypes = {
  children: CustomPropTypes.childrenOfLength({ min: 1 }),
  defaultOpen: PropTypes.bool,
  playlistOpenDelay: PropTypes.number,
};

export default Playlist;
