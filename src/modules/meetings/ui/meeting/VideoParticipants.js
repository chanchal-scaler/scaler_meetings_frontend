import React, { useEffect } from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { StreamsLayout, StreamTile } from '~meetings/ui/streams';
import { useMediaQuery } from '@common/hooks';
import { JOIN_MODES, STRINGS } from '~meetings/utils/constants';
import CompanionModeLoggedIn
  from '~meetings/images/companion-logged-in.svg';

function VideoParticipants({ mediaStore, meetingStore: store }) {
  const { desktop } = useMediaQuery();
  const { meeting } = store;
  const { videoBroadcasting } = meeting;
  const streams = desktop
    ? videoBroadcasting.primaryStreams
    : videoBroadcasting.streamsList;

  useEffect(() => {
    if (meeting.selectedRole === 'host') {
      videoBroadcasting.streamMedia();

      return () => {
        videoBroadcasting.unshareScreen();
        videoBroadcasting.unstreamMedia();
      };
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    meeting.selectedRole,
  ]);

  // Hook that handles switching microphone device
  useEffect(() => {
    videoBroadcasting.switchDevice('audio', mediaStore.audioDeviceId);
  }, [mediaStore.audioDeviceId, videoBroadcasting]);

  // Hook that handles switching camera device
  useEffect(() => {
    videoBroadcasting.switchDevice('video', mediaStore.videoDeviceId);
  }, [mediaStore.videoDeviceId, videoBroadcasting]);

  function streamUi(stream, index) {
    return (
      <StreamTile
        key={stream.id}
        position={index}
        stream={stream}
        type="primary"
      />
    );
  }

  function ui() {
    if (streams.length > 0) {
      return (
        <>
          {streams.map(streamUi)}
        </>
      );
    } else {
      let message = 'Waiting for host to join';
      if (videoBroadcasting.streamsList.length > 0) {
        message = 'Waiting for host to share his screen';
      }
      if (meeting.joiningMode === JOIN_MODES.companion) {
        message = STRINGS.companionModeMessage;
      }

      return (
        <HintLayout
          isTransparent
          message={message}
        />
      );
    }
  }

  function companionModeHint() {
    return (
      <HintLayout
        isTransparent
        message={STRINGS.companionModeMessage}
        img={CompanionModeLoggedIn}
        className="m-companion-mode-hint"
      />
    );
  }

  function defaultStreamsLayout() {
    return (
      <StreamsLayout
        hasPinnedStream={videoBroadcasting.hasPinnedStream}
        numStreams={streams.length}
      >
        {ui()}
      </StreamsLayout>
    );
  }

  return (
    <>
      {
        meeting.joiningMode === JOIN_MODES.companion ? (
          companionModeHint()
        ) : (
          defaultStreamsLayout()
        )
      }
    </>
  );
}

export default mobxify('mediaStore', 'meetingStore')(VideoParticipants);
