import React, { useCallback } from 'react';

import { BroadcastSetupModes } from '~meetings/utils/role';
import { dialog } from '@common/ui/general/Dialog';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';

function SwitchRole({ className, meetingStore: store }) {
  const { meeting } = store;
  const { manager, videoBroadcasting } = meeting;

  const handleBecomeAudience = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaBecomeAudienceClick,
      click_source: DRONA_SOURCES.meetingBottomPanel,
      click_text: 'Become audience',
      click_feature: DRONA_FEATURES.roleSwitch,
    });
    let content = 'Proceeding will stop sharing your media with others.';
    if (manager.isTemporaryHost) {
      content = `Proceeding will revoke your access to talk with host and `
        + `stop sharing your media with others.`;
    }
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content,
      onOk: () => {
        meeting.setSelectedRole('audience');
        // Revoke temporary host permission when audience is done talking
        if (manager.isTemporaryHost) {
          manager.setTemporaryHost(false);
        }
      },
    });
  }, [manager, meeting]);

  const handleBroadcastSetupMode = useCallback((mode) => {
    meeting.setBroadcastSetupMode(mode);
    if (mode === BroadcastSetupModes.host) {
      analytics.click({
        click_type: DRONA_TRACKING_TYPES.dronaBecomeHostClick,
        click_source: DRONA_SOURCES.meetingBottomPanel,
        click_text: 'Become host',
        click_feature: DRONA_FEATURES.roleSwitch,
      });
    }
  }, [meeting]);

  if (!videoBroadcasting || !videoBroadcasting.isLoaded) {
    return null;
  } else if (
    meeting.selectedRole === 'host'
    && (
      meeting.allowedRoles.length > 1
      || meeting.roleLevel === 0
    )
  ) {
    return (
      <IconButton
        className={className}
        disabled={videoBroadcasting.isUpdatingRole}
        icon="swap-role"
        label="Become audience"
        onClick={handleBecomeAudience}
        type={manager.isTemporaryHost ? 'primary' : 'default'}
      />
    );
  } else if (
    meeting.selectedRole !== 'host'
    && (
      manager.isTemporaryHost
      || meeting.canBroadcast
    )
  ) {
    let mode = BroadcastSetupModes.audience;
    let label = 'Share my audio/video';
    if (meeting.canBroadcast) {
      mode = BroadcastSetupModes.host;
      label = 'Become host';
    }

    return (
      <IconButton
        className={className}
        disabled={videoBroadcasting.isUpdatingRole}
        icon="swap-role"
        label={label}
        onClick={() => { handleBroadcastSetupMode(mode); }}
        type={manager.isTemporaryHost ? 'primary' : 'default'}
      />
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(SwitchRole);
