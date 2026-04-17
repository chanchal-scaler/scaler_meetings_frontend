import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { SwitchRow } from '@common/ui/general';
import { CHAT_RATE_LIMIT_TIMEOUT } from '~meetings/utils/messaging';

function ChatCooldown({ meetingStore: store }) {
  const { meeting } = store;

  if (meeting && meeting.manager && meeting.isSuperHost) {
    const { manager } = meeting;
    const settingKey = 'chat_cooldown_enabled';

    return (
      <SwitchRow
        activeColor="#0041ca"
        checked={manager.settings[settingKey]}
        hint={`
          If enabled, participants will have a cooldown period of
          ${CHAT_RATE_LIMIT_TIMEOUT}\u00A0seconds between sending chat messages
        `}
        label="Enable chat cooldown"
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

export default mobxify('meetingStore')(ChatCooldown);
