import React, { useCallback, useEffect, useState } from 'react';

import {
  Backdrop,
  Icon,
} from '@common/ui/general';
import { isIOS } from '@common/utils/platform';
import { isWebRTCSupportUnstable } from '~meetings/utils/media';
import { mobxify } from '~meetings/ui/hoc';

function AutoplayFixModal({ meetingStore: store }) {
  const [isOpen, setOpen] = useState(false);
  const { meeting } = store;
  const { videoBroadcasting } = meeting;
  const {
    isAutoPlayRestricted,
    remoteVideoStreams,
  } = videoBroadcasting;

  useEffect(() => {
    if (isAutoPlayRestricted) {
      setOpen(true);
      meeting.track(
        'autoplayBlocked',
        'log',
        parseInt(performance.now() / 1000, 10),
      );
    } else {
      setOpen(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlayRestricted]);

  const handleAcknowledgement = useCallback(() => {
    remoteVideoStreams.forEach(stream => {
      if (stream.isAutoPlayRestricted) {
        stream.resume();
      }
    });
    setOpen(false);
  }, [remoteVideoStreams]);

  // eslint-disable-next-line
  function messageUi() {
    if (isIOS()) {
      return (
        'We\'ve detected that the device that you are using is partially '
        + 'supported while everything should work fine for most of '
        + 'the time but if you face any issues with the audio/video playback '
        + 'please consider switching to a different device.'
      );
    } else {
      return (
        'We\'ve detected that the browser that you are using is partially '
        + 'supported while everything should work fine for most of '
        + 'the time but if you face any issues with the audio/video playback '
        + 'please consider switching to a different browser. We recommend '
        + 'using the latest version of chrome browser.'
      );
    }
  }

  if (isWebRTCSupportUnstable()) {
    return (
      <Backdrop
        className="cursor"
        closeOnEscPress={false}
        onClose={handleAcknowledgement}
        isOpen={isOpen}
      >
        <div className="column full-height flex-c light p-10">
          <Icon className="h1 m-b-10" name="volume-off" />
          <div className="h4 no-mgn-b" data-cy="meetings-auto-play-backdrop">
            Click to unmute
          </div>
        </div>
      </Backdrop>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(AutoplayFixModal);
