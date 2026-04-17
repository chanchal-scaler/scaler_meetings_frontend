import React from 'react';
import classNames from 'classnames';

import { mobxify } from '~meetings/ui/hoc';
import { FillLayout } from '@common/ui/layouts';
import { PlaybackControl, PlaybackView } from '~meetings/ui/playback';
import {
  AutoplayFixModal, NerdStats, PoorUploadNotification,
  VideoChannelStatus, VideoParticipants,
} from '~meetings/ui/meeting';
import { useFetchPlaylistSession, usePlaylistPreload } from '~meetings/hooks';


function VideoChannel({ meetingStore: store }) {
  const { meeting } = store;
  const { videoBroadcasting } = meeting;

  useFetchPlaylistSession(meeting);
  usePlaylistPreload(meeting.playlistPreloader);

  if (videoBroadcasting) {
    return (
      <div
        className={classNames(
          'video-channel',
          { 'video-channel--pinned': videoBroadcasting.hasPinnedStream },
        )}
      >
        {videoBroadcasting.isLoaded && <VideoParticipants />}
        {meeting.isSuperHost
          ? <PlaybackControl />
          : <PlaybackView />}
        <VideoChannelStatus />
        <NerdStats />
        <PoorUploadNotification />
        <AutoplayFixModal />
      </div>
    );
  } else {
    return <FillLayout type="flex-fill" />;
  }
}

export default mobxify('meetingStore')(VideoChannel);
