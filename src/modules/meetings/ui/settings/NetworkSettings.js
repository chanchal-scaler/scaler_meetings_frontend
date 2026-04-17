import React from 'react';
import classNames from 'classnames';

import { Charts } from '~charts';
import { Icon } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';

function NetworkSettings({ meetingStore: store }) {
  const { meeting } = store;
  const { videoBroadcasting } = meeting;

  const lineDataArray = [
    {
      dataKey: 'latency',
      stroke: '#8884d8',
    }, {
      dataKey: 'dangerLatency',
      stroke: '#ff2020',
    }, {
      dataKey: 'warningLatency',
      stroke: '#ffc834',
    },
  ];

  return (
    <div
      className={
        classNames(
          'm-settings-network',
          { 'm-t-20': meeting && meeting.canSetProxy },
        )
      }
    >
      <div className="h4 bold dark">Network Stability</div>
      <div className="bold h6 m-t-10 p-t-5 dark">
        Recommendations:
      </div>
      <div className="row h6 no-mgn-b align-c m-t-10">
        <Icon name="lock" className="m-r-5" />
        <div>If you are using WiFi, try moving closer to the router.</div>
      </div>
      <div className="row h6 no-mgn-b align-c m-t-10">
        <Icon name="lock" className="m-r-5" />
        <div>Check if you are connected to VPN or proxy.</div>
      </div>
      <div className="row h6 no-mgn-b align-c m-t-10">
        <Icon name="network-speed" className="m-r-5" />
        <div>Check your network speed.</div>
      </div>
      <ul className="h6 no-mgn-b">
        <li>&lt; 700 Kbps will be a poor experience.</li>
        <li>700 - 1500 Kbps may still face issues.</li>
        <li>&gt; 1500 Kbps is recommended.</li>
      </ul>
      <div className="bold h6 no-mgn-b m-t-20 p-t-5 dark">
        Connection
      </div>
      <div className="h6 no-mgn-b align-c m-t-5">
        Higher value or a large variation may cause a disturbance in
        the video quality.
      </div>
      {
        videoBroadcasting && (
          <div className="m-t-10">
            <Charts
              data={videoBroadcasting.networkLatencyData}
              width={400}
              height={200}
              margin={{
                top: 5, right: 20, bottom: 5, left: 0,
              }}
              lines={lineDataArray}
              xAxisDataKey="datetime"
              xAxisStyle={{ fontSize: '1.2rem' }}
              yAxisDataKey="latency"
              yAxisStyle={{ fontSize: '1.2rem' }}
              yAxisOrientation="right"
              yAxisUnit="ms"
            />
          </div>
        )
      }
    </div>
  );
}

export default mobxify('meetingStore')(NetworkSettings);
