import React from 'react';
import omit from 'lodash/omit';

import { ChatPermissionLevel } from '~meetings/utils/messaging';
import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import { RadioButton, RadioGroup } from '@common/ui/general';

const chatPermissionsMap = {
  [ChatPermissionLevel.all]: 'Public and private messages',
  [ChatPermissionLevel.public_and_hosts]:
    'Public and private messages to hosts',
  [ChatPermissionLevel.public]: 'Only public messages',
  [ChatPermissionLevel.hosts]: 'Only private messages to hosts',
  [ChatPermissionLevel.none]: 'No messages ',
};

function ChatPermissions({ meetingStore: store }) {
  const { meeting } = store;

  if (meeting && meeting.manager && meeting.isSuperHost) {
    const { manager } = meeting;
    let permissions = chatPermissionsMap;
    if (meeting.type === 'webinar') {
      permissions = omit(chatPermissionsMap, [ChatPermissionLevel.all]);
    }

    return (
      <Field label="Audience can send">
        <RadioGroup
          name="chatScope"
          onChange={({ target: { value } }) => {
            manager.updateSettingForAll('chat_scope', value);
          }}
          value={manager.settings.chat_scope}
        >
          {Object.keys(permissions).map((permission) => (
            <RadioButton
              key={permission}
              name={permission}
              text={chatPermissionsMap[permission]}
            />
          ))}
        </RadioGroup>
      </Field>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(ChatPermissions);
