import React from 'react';

import CloudProxyToggle from './CloudProxyToggle';
import NetworkSettings from './NetworkSettings';

function ConnectionSettings() {
  return (
    <div className="form">
      <CloudProxyToggle />
      <NetworkSettings />
    </div>
  );
}

export default ConnectionSettings;
