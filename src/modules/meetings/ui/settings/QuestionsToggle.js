import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { SwitchRow } from '@common/ui/general';

function QuestionsToggle({ meetingStore: store }) {
  const { meeting } = store;

  if (meeting && meeting.manager && meeting.isSuperHost) {
    const { manager } = meeting;
    const settingKey = 'questions_disabled';

    return (
      <SwitchRow
        activeColor="#0041ca"
        checked={manager.isQuestionsDisabled}
        label="Disable Questions"
        onChange={
          ({ target: { checked } }) => {
            manager.updateSettingForAll(settingKey, checked);
          }
        }
      />
    );
  }

  return null;
}

export default mobxify('meetingStore')(QuestionsToggle);
