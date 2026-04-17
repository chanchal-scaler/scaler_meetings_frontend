import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { SwitchRow } from '@common/ui/general';

function MultiScreenShare({ meetingStore: store }) {
  const { meeting } = store;

  if (meeting && meeting.manager && meeting.isSuperHost) {
    const { manager } = meeting;
    const settingKey = 'allow_multiple_screenshare';

    return (
      <SwitchRow
        activeColor="#0041ca"
        checked={manager.settings[settingKey]}
        hint="
          If enabled then will allow multiple hosts to share screen
          simultaneously
        "
        label="Allow multiple hosts to share screen"
        onChange={
          ({ target: { checked } }) => {
            manager.updateSettingForAll(settingKey, checked);
          }
        }
      />
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(MultiScreenShare);
