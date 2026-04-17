import React from 'react';
import classNames from 'classnames';

import { Icon } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaQuery } from '@common/hooks';
import { useStreamLayout } from '~meetings/hooks';
import { StreamsLayout } from '~meetings/ui/streams';
import PlaybackStream from './PlaybackStream';

let PlaybackBox = ({ meetingStore: store, position, layoutStore }) => {
  const dimensions = useStreamLayout(position, layoutStore);
  const { meeting } = store;
  const { playback } = meeting;

  return (
    <div
      className={classNames(
        'm-playback-box',
        { 'm-playback-box--active': playback.isActive || playback.onTop },
      )}
      style={dimensions}
    >
      <PlaybackStream className="m-playback-box__stream">
        <div className="m-playback-box__footer">
          <Icon className="primary" name="play" />
          <div className="m-playback-box__name">
            {playback.owner.name}
            {' '}
            (Video)
          </div>
        </div>
      </PlaybackStream>
    </div>
  );
};

PlaybackBox = mobxify('meetingStore', 'layoutStore')(PlaybackBox);

function PlaybackView({ meetingStore: store }) {
  const { desktop } = useMediaQuery();
  const { meeting } = store;
  const { playback, videoBroadcasting } = meeting;

  const streams = desktop
    ? videoBroadcasting.primaryStreams
    : videoBroadcasting.streamsList;

  if (playback && playback.isAdded) {
    return (
      <div className="m-playback-view">
        <StreamsLayout
          hasPinnedStream={videoBroadcasting.hasPinnedStream}
          numStreams={Math.max(1, streams.length)}
        >
          <PlaybackBox position={0} />
        </StreamsLayout>
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(PlaybackView);
