import React, { useCallback } from 'react';
import { observer } from 'mobx-react';

import { Slider } from '@common/ui/general';
import { toCountdown } from '~video_player/utils/date';

function Seekbar({ content }) {
  const { videoSession: session } = content;

  const handleSeek = useCallback((value) => {
    if (!session || !session.isOwner) {
      return;
    }

    session.seek(value);
  }, [session]);

  return (
    <div className="m-asl-seekbar">
      <Slider
        className="m-asl-seekbar__slider"
        disableControls={!session.isOwner}
        label={false}
        min={0}
        max={session.duration}
        onChange={handleSeek}
        value={session.progress}
      />
      <div className="m-t-10 m-asl-seekbar__time m-h-5">
        <div className="m-asl-current-btn m-r-5">
          {toCountdown(session.progress)}
        </div>
        <div className="m-asl-current-btn__time">
          /
          {' '}
          {toCountdown(session.duration)}
        </div>
      </div>
    </div>
  );
}

export default observer(Seekbar);
