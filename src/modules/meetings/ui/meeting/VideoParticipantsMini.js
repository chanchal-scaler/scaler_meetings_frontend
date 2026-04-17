import React from 'react';

import { AspectRatio } from '@common/ui/general';
import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaQuery } from '@common/hooks';
import { StreamsLayout, StreamTile } from '~meetings/ui/streams';
import { JOIN_MODES } from '~meetings/utils/constants';

function VideoParticipantsMini({ meetingStore: store }) {
  const { desktop } = useMediaQuery();
  const { meeting } = store;
  const { videoBroadcasting } = meeting;

  function streamUi(stream, index) {
    return (
      <StreamTile
        key={stream.id}
        position={index}
        stream={stream}
        type="secondary"
      />
    );
  }

  function ui() {
    if (videoBroadcasting.secondaryStreams.length > 0) {
      return (
        <>
          {videoBroadcasting.secondaryStreams.map(streamUi)}
        </>
      );
    } else {
      return (
        <HintLayout
          message="Waiting for host to join"
        />
      );
    }
  }

  if (
    desktop
    && videoBroadcasting
    && videoBroadcasting.isScreenShareMaximised
    && meeting.joiningMode !== JOIN_MODES.companion
  ) {
    return (
      <AspectRatio
        className="full-width border-bottom"
        ratio={16 / 9}
      >
        <StreamsLayout
          hasPinnedStream
          numStreams={videoBroadcasting.secondaryStreams.length}
        >
          {ui()}
        </StreamsLayout>
      </AspectRatio>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(VideoParticipantsMini);
