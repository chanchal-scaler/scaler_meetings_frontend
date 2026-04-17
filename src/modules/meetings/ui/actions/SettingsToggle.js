import React, { useCallback } from 'react';

import {
  DRONA_FEATURES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';

function SettingsToggle({ settingsStore, source = 'NA', ...remainingProps }) {
  const handleSettingsModalOpen = useCallback(() => {
    settingsStore.setSettingsModalOpen(true);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaSettingsClick,
      click_feature: DRONA_FEATURES.meetingControls,
      click_source: source,
    });
  }, [settingsStore, source]);
  return (
    <IconButton
      icon="settings"
      data-cy="meeting-settings-button"
      type={settingsStore.isSettingsModalOpen ? 'primary' : 'default'}
      onClick={handleSettingsModalOpen}
      {...remainingProps}
    />
  );
}

export default mobxify('settingsStore')(SettingsToggle);
