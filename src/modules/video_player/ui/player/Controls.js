import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  Bookmark,
  Forward,
  Fullscreen,
  NextVideo,
  PlaybackRate,
  PlaylistToggle,
  PlayToggle,
  PictureInPicture,
  Quality,
  Rewind,
  Volume,
} from '~video_player/ui/controls';
import { isNullOrUndefined } from '@common/utils/type';
import { toCountdown } from '~video_player/utils/date';
import {
  useActions,
  useBookmarkEnabled,
  useControlsFallback,
  useGlobalState,
  useShortcuts,
} from '~video_player/hooks';
import { useIsTouch, useUnmountedRef } from '@common/hooks';
import AddBookmark from '~video_player/ui/bookmarks/AddBookmark';
import EditBookmark from '~video_player/ui/bookmarks/EditBookmark';
import ControlItem from './ControlItem';
import Seekbar from '~video_player/ui/seekbar';

// Time after which controls will be auto hidden
const AUTO_HIDE_TIMEOUT = 2000;

function Controls({
  additionalControls = [],
  children,
  className,
  newBookmarkInputClassName,
  onBookmarkAdd,
  onBookmarkDelete,
  onBookmarkUpdate,
  onVisibilityChange,
  playbackTooltip = null,
  playbackRates,
  playlistNudgeContent,
}) {
  const unmountedRef = useUnmountedRef();
  const isTouch = useIsTouch();
  const isFallback = useControlsFallback();
  const timeout = useRef(null);
  const [isVisible, setVisible] = useState(false);

  const {
    bookmarkTime,
    currentResumeAt,
    currentTime,
    duration,
    editingBookmark,
    isEnded,
    isLoading,
    isMetaLoaded,
    isPlayed,
    isPlaying,
    isPlaylistOpen,
    isSeeking,
    next,
    playlist,
    seekTo,
  } = useGlobalState();

  const {
    nextVideo,
    play,
    togglePlay,
    setSeekTo,
    setBookmarkEnabled,
    setHasControls,
    setQuickAction,
  } = useActions();

  const canAddBookmark = useBookmarkEnabled();
  const isAddingBookmark = bookmarkTime > 0;
  const isEditingBookmark = !isNullOrUndefined(editingBookmark);

  useShortcuts();

  useEffect(() => {
    setHasControls(true);

    return () => setHasControls(false);
  }, [setHasControls]);

  const handleShow = useCallback(() => {
    clearTimeout(timeout.current);

    setVisible(true);
    timeout.current = setTimeout(() => {
      // If unmounted then return
      if (unmountedRef.current) return;

      setVisible(false);
    }, AUTO_HIDE_TIMEOUT);
  }, [unmountedRef]);

  const handleRootClick = useCallback((event) => {
    if (!isTouch && !isFallback && event.target === event.currentTarget) {
      togglePlay();
      setQuickAction(isPlaying ? 'pause' : 'play');
    }

    handleShow(event);
  }, [isTouch, isFallback, handleShow, togglePlay, setQuickAction, isPlaying]);

  useEffect(() => {
    handleShow();
  }, [handleShow, seekTo]);

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isVisible || !isPlayed);
    }
  }, [isPlayed, isVisible, onVisibilityChange]);

  useEffect(() => {
    setBookmarkEnabled(Boolean(onBookmarkAdd));
  }, [onBookmarkAdd, setBookmarkEnabled]);

  function endUi() {
    if (next > -1) {
      const { title } = playlist[next];
      return (
        <div className="vp-controls__next">
          <h5 className="normal">Up next</h5>
          <h2 className="m-b-15">{title}</h2>
          <ControlItem
            className="vp-controls__end-action"
            icon="next"
            label="Next video"
            onClick={nextVideo}
          />
        </div>
      );
    } else {
      return (
        <ControlItem
          className="vp-controls__end-action"
          icon="refresh"
          label="Play again"
          onClick={() => {
            setSeekTo(0);
            play();
          }}
        />
      );
    }
  }

  function centerUi() {
    if (isFallback) {
      return null;
    } else if (!isPlayed) {
      return (
        <div className="vp-controls__center">
          <ControlItem
            className="column"
            icon="play"
            large
            onClick={play}
          >
            <span className="h3 m-t-5 no-mgn-b">
              {currentResumeAt > 0 ? 'Resume' : 'Play'}
            </span>
          </ControlItem>
        </div>
      );
    } else if (isEnded) {
      return (
        <div className="vp-controls__center">
          {endUi()}
        </div>
      );
    } else if (isSeeking || isLoading || !isMetaLoaded) {
      return (
        <div
          className="
            vp-controls__center
            vp-controls__center--overlay
            vp-controls__center--rounded
          "
        >
          <div className="vp-controls__loader" />
        </div>
      );
    } else {
      return null;
    }
  }

  function durationUi() {
    return (
      <div className="vp-controls__duration" data-cy="video-player-duration">
        {toCountdown(currentTime)}
        {' / '}
        {toCountdown(duration)}
      </div>
    );
  }

  function controlsUi() {
    if (isFallback) {
      return (
        <div className="vp-controls__row">
          <div className="vp-controls__spacer" />
          <div className="vp-controls__group vp-controls__group--right">
            {additionalControls}
            <PlaylistToggle playlistNudgeContent={playlistNudgeContent} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="vp-controls__row">
          <div className="vp-controls__group vp-controls__group--left">
            <Rewind />
            <PlayToggle />
            <Forward />
          </div>
          {durationUi()}
          <div className="vp-controls__spacer" />
          <div className="vp-controls__group vp-controls__group--right">
            {additionalControls}
            <NextVideo />
            <PlaylistToggle playlistNudgeContent={playlistNudgeContent} />
            <Bookmark />
            <Volume />
            <PlaybackRate
              playbackTooltip={playbackTooltip}
              playbackRates={playbackRates}
            />
            <Quality />
            <PictureInPicture />
            <Fullscreen />
          </div>
        </div>
      );
    }
  }

  function seekUi() {
    if (!isFallback) {
      return (
        <div className="vp-controls__seekbar vp-bookmarks-container">
          <Seekbar />
          {children}
        </div>
      );
    } else {
      return null;
    }
  }

  function deckUi() {
    const shouldShowControls = (
      isVisible
      || isSeeking
      || isPlaylistOpen
      || isEnded
      || isAddingBookmark
      || isEditingBookmark
      || !isPlayed
    );

    return (
      <div
        className={classNames(
          'vp-controls__deck',
          { 'vp-controls__deck--hidden': !shouldShowControls },
          { [className]: className },
        )}
      >
        {seekUi()}
        {controlsUi()}
      </div>
    );
  }

  function addBookmarkUi() {
    if (canAddBookmark) {
      return (
        <AddBookmark
          inputClassName={newBookmarkInputClassName}
          onAdd={onBookmarkAdd}
        />
      );
    } else {
      return null;
    }
  }

  function editBookmarkUi() {
    if (isEditingBookmark) {
      return (
        <EditBookmark
          onDelete={onBookmarkDelete}
          onUpdate={onBookmarkUpdate}
        />
      );
    } else {
      return null;
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={classNames(
        'vp-controls',
        { 'vp-controls--fallback': isFallback },
        { 'vp-controls--overlay': !isFallback && isEnded },
      )}
      onMouseMove={handleShow}
      onClick={handleRootClick}
    >
      {centerUi()}
      {deckUi()}
      {addBookmarkUi()}
      {editBookmarkUi()}
    </div>
  );
}

Controls.propTypes = {
  additionalControls: PropTypes.arrayOf(PropTypes.node),
  onBookmarkAdd: PropTypes.func,
  onBookmarkDelete: PropTypes.func,
  onBookmarkUpdate: PropTypes.func,
  onVisibilityChange: PropTypes.func,
  playbackTooltip: PropTypes.node,
  playbackRates: PropTypes.arrayOf(PropTypes.number),
};

export default Controls;
