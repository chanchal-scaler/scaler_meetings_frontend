import React from 'react';
import { Observer } from 'mobx-react';

import { Accordion } from '@common/ui/general';
import { HintLayout } from '@common/ui/layouts';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';

function NerdStats({ meetingStore: store }) {
  const { meeting } = store;
  const { videoBroadcasting } = meeting;

  function statRowUi(label, value) {
    return (
      <div className="nerd-stats__row">
        <div className="nerd-stats__col nerd-stats__col--label">
          {label}
          :
        </div>
        <div className="nerd-stats__col nerd-stats__col--value">
          {value}
        </div>
      </div>
    );
  }

  function summaryUi({ active, onClick }) {
    return (
      <Observer>
        {() => (
          <div className="nerd-stats__summary">
            {statRowUi('Total Resolution', videoBroadcasting.totalResolution)}
            {statRowUi(
              'Total Streaming Resolution',
              videoBroadcasting.totalStreamingResolution,
            )}
            {statRowUi('Billing Category', videoBroadcasting.billingCategory)}
            {/* eslint-disable-next-line */}
            <a
              className="nerd-stats__expand"
              onClick={onClick}
            >
              {active ? 'Show less' : 'Show more'}
            </a>
            <IconButton
              className="nerd-stats__close"
              icon="clear"
              onClick={() => videoBroadcasting.setStatsEnabled(false)}
            />
          </div>
        )}
      </Observer>
    );
  }

  function statUi(stream) {
    const { frameRate, height, width } = stream.stats;
    return (
      <div
        key={stream.id}
        className="nerd-stats__item"
      >
        <div className="nerd-stats__header">
          {stream.label}
          {' '}
          | Stats
        </div>
        <div className="nerd-stats__list">
          {statRowUi('Resolution', `${width} X ${height} (${width * height})`)}
          {statRowUi('FPS', frameRate)}
        </div>
      </div>
    );
  }

  function statsUi() {
    const streams = videoBroadcasting.webrtcStreamsList.filter(
      stream => Boolean(stream.stats),
    );

    if (streams.length > 0) {
      return (
        <div className="nerd-stats__detailed">
          {streams.map(statUi)}
        </div>
      );
    } else {
      return (
        <HintLayout
          isFit
          isTransparent
          message="Nothing is being streamed"
        />
      );
    }
  }

  if (videoBroadcasting && videoBroadcasting.isStatsEnabled) {
    return (
      <div className="nerd-stats scroll">
        <Accordion
          title={summaryUi}
        >
          {statsUi()}
        </Accordion>
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(NerdStats);
