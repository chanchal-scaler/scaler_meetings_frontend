import React from 'react';
import { observer } from 'mobx-react';

import PauseButton from './PauseButton';
import PlaybackRate from './PlaybackRate';
import Seekbar from './Seekbar';
import StopButton from './StopButton';

function PlaylistControls({ content }) {
  const { activeSession } = content;
  if (activeSession?.isPlaying && content.videoSession) {
    return (
      <div className="m-10 m-assisted-live-card__player">
        <div className="m-asl-controls">
          <div className="row space-between">
            <PauseButton content={content} />
            <PlaybackRate content={content} />
            <StopButton content={content} />
          </div>
          <Seekbar content={content} />
        </div>
      </div>
    );
  } else if (activeSession?.isWaiting) {
    return (
      <div className="m-10 m-assisted-live-card__player">
        Video is starting...
      </div>
    );
  } else {
    return null;
  }
}

export default observer(PlaylistControls);
