import { observer } from 'mobx-react';
import React from 'react';

import { Avatar } from '@common/ui/general';
import { VideoStreamTypes } from '~meetings/utils/stream';
import StreamVideo from './StreamVideo';

function CDNVideo({
  avatarSize,
  hidden,
  stream,
  type,
}) {
  const isAvVideoPlaying = stream.type === VideoStreamTypes.av
    && !stream.isVideoPlaying;

  return (
    <StreamVideo
      stream={stream}
      type={type}
      shouldNotPlay={false}
      isPlaybackHidden={
        (
          stream.isVideoDisabled
          || stream.isVideoMuted
          || stream.isEnded
          || stream.isBuffering
          || !stream.isReady
          || isAvVideoPlaying
          || hidden
        )
        && !stream.isConnectionPaused
      }
      canDisableVideo={stream.type !== VideoStreamTypes.screen}
    >
      {(
        stream.isVideoDisabled
        || stream.isVideoMuted
        || isAvVideoPlaying
      )
      && !stream.isConnectionPaused
      && (
        <div className="video-playback__fallback">
          <Avatar
            image={stream.participant.avatar}
            size={avatarSize}
            title={stream.participant.name}
          />
        </div>
      )}
    </StreamVideo>
  );
}

export default observer(CDNVideo);
