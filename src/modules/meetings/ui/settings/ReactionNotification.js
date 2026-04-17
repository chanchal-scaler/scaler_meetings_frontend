import React from 'react';
import classNames from 'classnames';

import { reactionNotificationStatus } from '~meetings/utils/messaging';
import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import { RadioButton, RadioGroup } from '@common/ui/general';

const reactionNotificationMap = {
  [reactionNotificationStatus.enabled]: 'Enabled',
  [reactionNotificationStatus.disabled]: 'Disabled',
};

function ReactionNotification({
  className,
  settingsStore: store,
  ...remainingProps
}) {
  return (
    <Field
      className={classNames(
        'm-setting-c-notification',
        `m-setting-c-notification--loose`,
        { [className]: className },
      )}
      label="Reaction Notification"
      {...remainingProps}
    >
      <RadioGroup
        name="reactionNotification"
        onChange={
          event => store.setReactionNotificationEnabled(event.target.value)
        }
        value={store.reactionNotificationEnabled}
      >
        {Object.keys(reactionNotificationMap).map(option => (
          <RadioButton
            key={option}
            name={option}
            value={option}
            text={reactionNotificationMap[option]}
          />
        ))}
      </RadioGroup>
    </Field>
  );
}

export default mobxify('settingsStore')(ReactionNotification);
