import React, { useCallback } from 'react';
import classNames from 'classnames';

import { AspectRatio, Icon } from '@common/ui/general';
import { isIOS, isSafari } from '@common/utils/platform';
import { isNullOrUndefined } from '@common/utils/type';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaStream } from '~meetings/hooks';

// In iOS device and Safari browsers it is not allowed to stream to
// multiple video elements
const hasPreview = !isIOS() && !isSafari();

function VideoPreview({ mediaStore: store }) {
  const { playerRef, stream } = useMediaStream({
    audio: false,
    video: store.videoConstraints,
    shouldLoad: hasPreview && store.video,
  });

  const {
    hasVideoHardwareError,
    videoHardwareError,
  } = store;

  const handlePlay = useCallback(() => {
    playerRef.current.play();
  }, [playerRef]);

  /**
   * If we have videoInputs, and don't have any default video device,
   * we should prompt user to select video device
   */
  if (!store.hasSelectedVideoInput) {
    return (
      <AspectRatio
        containerClassName="video-input__preview"
        ratio={16 / 9}
      >
        <div className="video-input__hint">
          <Icon className="m-b-5 h1" name="info" />
          <p className="no-mgn-b">Please select a camera</p>
        </div>
      </AspectRatio>
    );
  } else if (!store.hasVideoPermissions) {
    return (
      <AspectRatio
        containerClassName="video-input__preview"
        ratio={16 / 9}
      >
        <div className="video-input__hint">
          <Icon className="m-b-5 h1" name="info" />
          <p className="no-mgn-b">Please enable camera permissions</p>
        </div>
      </AspectRatio>
    );
  } else if (hasVideoHardwareError) {
    return (
      <AspectRatio
        containerClassName="video-input__preview"
        ratio={16 / 9}
      >
        <div className="video-input__hint">
          <Icon className="m-b-5 h1" name="info" />
          <p className="no-mgn-b">
            {videoHardwareError.message || 'Unable to load your camera'}
          </p>
        </div>
      </AspectRatio>
    );
  } else if (hasPreview) {
    return (
      <AspectRatio
        containerClassName="video-input__preview"
        ratio={16 / 9}
      >
        {store.video && (
          <video
            ref={playerRef}
            className={classNames(
              'video-input__stream',
              { 'video-input__stream--hidden': isNullOrUndefined(stream) },
            )}
            onLoadedMetadata={handlePlay}
            playsInline
          />
        )}
      </AspectRatio>
    );
  } else {
    return (
      <AspectRatio
        containerClassName="video-input__preview"
        ratio={16 / 9}
      >
        <div className="video-input__hint">
          <Icon className="m-b-5 h1" name="info" />
          <p className="no-mgn-b">No Preview</p>
        </div>
      </AspectRatio>
    );
  }
}

export default mobxify('mediaStore', 'meetingStore')(VideoPreview);
