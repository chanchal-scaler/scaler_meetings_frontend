import React, { useCallback } from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';

import analytics from '@common/utils/analytics';

const panels = [{
  label: 'Video',
  icon: 'camera',
  name: 'video',
}, {
  label: 'Audio',
  icon: 'mic',
  name: 'audio',
}, {
  label: 'Chat',
  icon: 'chat',
  name: 'chat',
}, {
  label: 'Screen',
  icon: 'share-screen',
  name: 'screen',
}, {
  label: 'Connection',
  icon: 'bars',
  name: 'connection',
}, {
  label: 'Admin',
  icon: 'settings',
  name: 'admin',
}];

let PanelItem = function ({
  activeTab,
  icon,
  label,
  name,
  settingsStore: store,
}) {
  const handleClick = useCallback(() => {
    if (name === 'connection') {
      analytics.click({
        click_type: DRONA_TRACKING_TYPES.dronaNetworkSpeed,
        click_source: DRONA_SOURCES.meetingSettingsPanel,
        click_text: 'Connection',
        click_feature: DRONA_FEATURES.troubleshooting,
      });
    }
    store.setActiveTab(name);
  }, [name, store]);

  return (
    <Tappable
      className={classNames(
        'm-setting-panels__item',
        { 'm-setting-panels__item--active': name === activeTab },
      )}
      onClick={handleClick}
    >
      <Icon
        className="m-setting-panels__icon"
        name={icon}
      />
      <span className="m-setting-panels__label">
        {label}
      </span>
      <span className="show-in-mobile m-l-10">
        <Icon
          className="h3"
          name="chevron-right"
        />
      </span>
    </Tappable>
  );
};

PanelItem = mobxify('settingsStore')(PanelItem);

function isPanelVisible(panel, meeting) {
  switch (panel.label) {
    case 'Screen':
      // show screen share setting only if new screen share is not enabled
      return meeting && !meeting.isNewScreenShareEnabled;
    case 'Admin':
      return meeting && meeting.isSuperHost && meeting.isJoined;
    case 'Connection':
      return meeting;
    default:
      return true;
  }
}

function Panels({ activeTab, meetingStore }) {
  const { meeting } = meetingStore;

  return (
    <div className="m-setting-panels">
      {panels.map((item) => {
        if (isPanelVisible(item, meeting)) {
          return (
            <PanelItem
              key={item.name}
              activeTab={activeTab}
              {...item}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

export default mobxify('meetingStore')(Panels);
