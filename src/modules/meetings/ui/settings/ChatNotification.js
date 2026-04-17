import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { ChatNotificationLevel } from '~meetings/utils/messaging';
// import {
//   DRONA_TRACKING_TYPES,
// } from '~meetings/utils/trackingEvents';
import { Field } from '@common/ui/form';
import { mobxify } from '~meetings/ui/hoc';
import { RadioButton, RadioGroup } from '@common/ui/general';
import { Select } from '~meetings/ui/general';
// import analytics from '@common/utils/analytics';

const notificationLevelMap = {
  [ChatNotificationLevel.all]: 'All new messages',
  [ChatNotificationLevel.dm]: 'Private messages',
  [ChatNotificationLevel.none]: 'Nothing',
};

const getGTMEventProps = (level) => ({
  gtmEventType: 'notify_me_dropdown',
  gtmEventResult: notificationLevelMap[level],
  gtmEventAction: 'click',
  gtmEventCategory: 'drona',
});

function ChatNotification({
  className,
  settingsStore: store,
  variant = 'loose',
  ...remainingProps
}) {
  function inputUi() {
    if (variant === 'loose') {
      return (
        <RadioGroup
          name="notificationLevel"
          onChange={event => store.setNotificationLevel(event.target.value)}
          value={store.notificationLevel}
        >
          {Object.keys(notificationLevelMap).map((level) => (
            <RadioButton
              key={level}
              name={level}
              text={notificationLevelMap[level]}
              {...getGTMEventProps(level)}
            />
          ))}
        </RadioGroup>
      );
    } else {
      return (
        <Select
          name="notificationLevel"
          onChange={event => store.setNotificationLevel(event.target.value)}
          small
          value={store.notificationLevel}
        >
          {Object.keys(notificationLevelMap).map((level) => (
            <Select.Option
              key={level}
              value={level}
              {...getGTMEventProps(level)}
            >
              {notificationLevelMap[level]}
            </Select.Option>
          ))}
        </Select>
      );
    }
  }

  return (
    <Field
      inline={variant === 'compact'}
      className={classNames(
        'm-setting-c-notification',
        `m-setting-c-notification--${variant}`,
        { [className]: className },
      )}
      label="Notify me about"
      {...remainingProps}
    >
      {inputUi()}
    </Field>
  );
}

ChatNotification.propTypes = {
  variant: PropTypes.oneOf(['loose', 'compact']).isRequired,
};

export default mobxify('settingsStore')(ChatNotification);
