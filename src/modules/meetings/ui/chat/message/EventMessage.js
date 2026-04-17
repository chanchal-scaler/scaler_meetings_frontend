import React from 'react';
import { observer } from 'mobx-react';

import { Icon } from '@common/ui/general';
import { isNullOrUndefined } from '@common/utils/type';
import { EventTypes } from '~meetings/models/eventMessage';

const eventIconsMap = {
  [EventTypes.joined]: 'enter',
  [EventTypes.left]: 'exit',
};

function EventMessage({ message }) {
  function iconUi() {
    const iconName = eventIconsMap[message.name];
    if (isNullOrUndefined(iconName)) {
      return null;
    } else {
      return (
        <div className="message-event__icon">
          <Icon name={iconName} />
        </div>
      );
    }
  }

  function bodyUi() {
    return (
      <div className="message-event__body">
        {message.body}
      </div>
    );
  }

  return (
    <div className="message-event">
      {iconUi()}
      {bodyUi()}
    </div>
  );
}

export default observer(EventMessage);
