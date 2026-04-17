import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { CDNVideo, WebRTCVideo } from './content_types';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { StreamContentTypes } from '~meetings/utils/stream';
import { useReloadStream, useStreamLayout } from '~meetings/hooks';

const streamRenderersMap = {
  [StreamContentTypes.webrtc]: WebRTCVideo,
  [StreamContentTypes.cdn]: CDNVideo,
};

const MAX_AVATAR_SIZE = 200;

function StreamTile({
  position,
  stream,
  type,
  layoutStore,
}) {
  const dimensions = useStreamLayout(position, layoutStore);
  const willAutoReload = useReloadStream(stream);

  // Video element is hidden if the area is less
  const isHiddenBySize = dimensions.width * dimensions.height < 4;

  const { playback } = stream.meeting;
  const isHiddenByOverlay = playback.isActive;

  function ui() {
    if (stream.isLoaded) {
      const avatarSize = Math.min(
        MAX_AVATAR_SIZE,
        dimensions.width / 3,
        dimensions.height / 3,
      );
      const StreamRenderer = streamRenderersMap[stream.contentType];
      if (StreamRenderer) {
        return (
          <StreamRenderer
            avatarSize={avatarSize}
            hidden={isHiddenBySize || isHiddenByOverlay}
            stream={stream}
            type={type}
          />
        );
      } else {
        return null;
      }
    } else if (layoutStore.isRecording) {
      return null;
    } else if (stream.isLoading || willAutoReload) {
      return (
        <LoadingLayout
          isFit
          isTransparent
          small
        />
      );
    } else if (stream.loadError) {
      return (
        <HintLayout
          isFit
          isTransparent
          message="Failed to load stream"
          actionLabel="Try again"
          actionFn={() => stream.load()}
        />
      );
    } else {
      return null;
    }
  }

  return (
    <div
      className={classNames(
        'stream-tile',
        { 'stream-tile--recording': layoutStore.isRecording },
      )}
      style={dimensions}
    >
      {ui()}
    </div>
  );
}

StreamTile.propTypes = {
  position: PropTypes.number.isRequired,
  stream: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['primary', 'secondary']).isRequired,
};

export default mobxify('layoutStore')(StreamTile);
