import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import ControlItem from '~video_player/ui/player/ControlItem';
import { Nudge } from '@common/ui/general';
import { ONE_WEEK } from '@common/utils/date';
import {
  useActions,
  useGlobalState,
} from '~video_player/hooks';
import { useMediaQuery } from '@common/hooks';

const NUDGE_TRIANGLE_PROPS = {
  size: 10,
};

function PlaylistNudgeContent() {
  return (
    <div className="h6 no-mgn-b m-l-10 bold">
      <span>Click on playlist to view more videos.</span>
    </div>
  );
}

function PlaylistToggle({
  className, playlistNudgeContent = <PlaylistNudgeContent />, ...remainingProps
}) {
  const { tablet } = useMediaQuery();
  const { playlist, isPlaylistOpen } = useGlobalState();

  const { togglePlaylist } = useActions();

  if (playlist.length > 1) {
    return (
      <Nudge
        component={ControlItem}
        closeOnClick
        content={playlistNudgeContent}
        name="vp-playlist-available-nudge"
        numCloses={3}
        isActive={!isPlaylistOpen}
        placement={tablet ? 'left' : 'top'}
        triangleProps={NUDGE_TRIANGLE_PROPS}
        className={classNames(
          'vp-controls__control',
          { [className]: className },
        )}
        icon="playlist"
        label="Toggle playlist (P)"
        onClick={togglePlaylist}
        interval={ONE_WEEK}
        {...remainingProps}
      />
    );
  } else {
    return null;
  }
}

PlaylistToggle.propTypes = {
  playlistNudgeContent: PropTypes.node,
};

export default PlaylistToggle;
