import React, { useCallback } from 'react';

import { canRaiseHand } from '~meetings/utils/meeting';
import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';

function RaiseHand({ className, meetingStore: store }) {
  const { meeting } = store;
  const { manager } = meeting;

  const handleRaiseHand = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaRaiseHandClick,
      click_source: DRONA_SOURCES.meetingBottomPanel,
      click_text: 'Raise Hand',
      click_feature: DRONA_FEATURES.meetingControls,
    });
    manager.raiseHand();
  }, [manager]);

  if (
    canRaiseHand(meeting.type)
    && meeting.roleLevel < 1
    && !manager.isTemporaryHost
  ) {
    return (
      <IconButton
        className={className}
        type={manager.isRaiseHandDisabled ? 'primary' : 'default'}
        icon="hand"
        label="Raise hand"
        onClick={handleRaiseHand}
        data-cy="meetings-raise-hand-button"
      >
        <span className="hide-in-tablet h4 m-l-5 no-mgn-b">
          Raise hand
        </span>
      </IconButton>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(RaiseHand);
