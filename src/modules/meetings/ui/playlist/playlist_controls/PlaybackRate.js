import React, { useCallback } from 'react';
import { observer } from 'mobx-react';

import { PLAYLIST_CONTENT_PLAYBACK_RATES } from '~meetings/utils/playlist';
import { Select } from '~meetings/ui/general';

function PlaybackRate({ content }) {
  const { videoSession: session } = content;

  const handleUpdate = useCallback((event) => {
    session.updatePlaybackRate(event.target.value);
  }, [session]);

  if (session.isOwner) {
    return (
      <Select
        adaptivePlacement
        className="m-asl-playback-rate"
        name="playbackRate"
        onChange={handleUpdate}
        small
        value={session.playbackRate}
      >
        {PLAYLIST_CONTENT_PLAYBACK_RATES.map(rate => (
          <Select.Option
            key={rate}
            value={rate}
            className="m-asl-current-btn__options"
          >
            {rate}
            x
          </Select.Option>
        ))}
      </Select>
    );
  } else {
    return null;
  }
}

export default observer(PlaybackRate);
