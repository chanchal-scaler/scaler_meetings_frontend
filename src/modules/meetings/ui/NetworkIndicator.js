import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Icon, Tooltip } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { NetworkQuality } from '~meetings/utils/network';

const networkQualityLabelsMap = {
  [NetworkQuality.average]: 'poor',
  [NetworkQuality.bad]: 'very bad',
};

function NetworkIndicator({
  className,
  meetingStore: store,
  small,
}) {
  const { meeting } = store;
  const { videoBroadcasting } = meeting;

  if (!videoBroadcasting || !videoBroadcasting.isNetworkPoor) {
    return null;
  }

  const label = networkQualityLabelsMap[videoBroadcasting.networkQuality];
  const title = `Your network connection is ${label}`;

  return (
    <Tooltip
      className={classNames(
        'm-network-indicator',
        {
          'm-network-indicator--danger': (
            videoBroadcasting.networkQuality === NetworkQuality.bad
          ),
        },
        { 'm-network-indicator--small': small },
        { [className]: className },
      )}
      popoverProps={{
        placement: 'left',
        margin: { left: -10 },
      }}
      title={title}
    >
      <Icon className="m-network-indicator__icon" name="bars" />
    </Tooltip>
  );
}

NetworkIndicator.propTypes = {
  small: PropTypes.bool,
};

export default mobxify('meetingStore')(NetworkIndicator);
