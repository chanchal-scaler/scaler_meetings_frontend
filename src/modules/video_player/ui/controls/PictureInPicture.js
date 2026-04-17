import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';

import { useGlobalState, useActions } from '~video_player/hooks';
import ControlItem from '~video_player/ui/player/ControlItem';

function PictureInPicture({ className, ...remainingProps }) {
  const { videoPlayerEl } = useGlobalState();
  const { setPictureInPicture } = useActions();
  const { pictureInPictureEnabled } = document;

  const enterPictureInPicture = useCallback(() => {
    setPictureInPicture(true);
  }, [setPictureInPicture]);

  const exitPictureInPicture = useCallback(() => {
    setPictureInPicture(false);
  }, [setPictureInPicture]);

  useEffect(() => {
    if (!videoPlayerEl) return undefined;

    if (pictureInPictureEnabled) {
      videoPlayerEl.addEventListener(
        'enterpictureinpicture',
        enterPictureInPicture,
      );
      videoPlayerEl.addEventListener(
        'leavepictureinpicture',
        exitPictureInPicture,
      );
    }

    return () => {
      if (pictureInPictureEnabled) {
        videoPlayerEl.removeEventListener(
          'enterPictureInPicture',
          enterPictureInPicture,
        );
        videoPlayerEl.removeEventListener(
          'leavepictureinpicture',
          exitPictureInPicture,
        );
      }
    };
  }, [
    enterPictureInPicture, exitPictureInPicture,
    pictureInPictureEnabled, videoPlayerEl,
  ]);

  /**
   * Close PiP mode when video is unmounted. This is needed because the video
   * PiP stays open after the user is navigated away from the video page in
   * a single-page app.
   */
  useEffect(() => () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
  }, []);

  const handleClick = useCallback(() => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      videoPlayerEl.requestPictureInPicture();
    }
  }, [videoPlayerEl]);

  if (pictureInPictureEnabled) {
    return (
      <ControlItem
        className={classNames(
          'vp-controls__control',
          { [className]: className },
        )}
        icon="picture-in-picture"
        label="Picture in picture (PiP)"
        data-cy="video-player-controls-picture-in-picture-button"
        onClick={handleClick}
        {...remainingProps}
      />
    );
  } else {
    return null;
  }
}

export default PictureInPicture;
