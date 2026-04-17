import React, { useCallback } from 'react';

import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { SCREEN_ORIENTATIONS } from '~meetings/utils/layout';

function RotateScreen({ className, meetingStore: store }) {
  const { meeting } = store;

  const handleClick = useCallback(() => {
    meeting.toggleScreenOrientation();
  }, [meeting]);

  return (
    <IconButton
      className={className}
      icon="phone-rotate"
      label={meeting.screenOrientation}
      gtmEventType="phone_rotate_action"
      gtmEventAction="click"
      gtmEventResult={
        meeting.screenOrientation === SCREEN_ORIENTATIONS.LANDSCAPE
          ? 'phone_rotate_portrait'
          : 'phone_rotate_landscape'
      }
      gtmEventCategory="drona"
      onClick={handleClick}
    />
  );
}

export default mobxify('meetingStore')(RotateScreen);
