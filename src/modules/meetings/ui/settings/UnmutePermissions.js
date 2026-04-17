import React from 'react';

import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import { RadioButton, RadioGroup } from '@common/ui/general';
import { UnmuteAccessLevel } from '~meetings/utils/meeting';

const unmutePermissionsMap = {
  [UnmuteAccessLevel.all]: 'Audio, video and screen',
  [UnmuteAccessLevel.video]: 'Only audio and video',
  [UnmuteAccessLevel.audio]: 'Only audio',
};

function UnmutePermissions({ meetingStore: store }) {
  const { meeting } = store;

  if (meeting && meeting.manager && meeting.isSuperHost) {
    const { manager } = meeting;
    return (
      <Field label="When unmuted audience can share">
        <RadioGroup
          name="unmuteAccess"
          onChange={({ target: { value } }) => {
            manager.updateSettingForAll('unmute_access', value);
          }}
          value={manager.settings.unmute_access}
        >
          {Object.keys(unmutePermissionsMap).map((permission) => (
            <RadioButton
              key={permission}
              name={permission}
              text={unmutePermissionsMap[permission]}
            />
          ))}
        </RadioGroup>
      </Field>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(UnmutePermissions);
