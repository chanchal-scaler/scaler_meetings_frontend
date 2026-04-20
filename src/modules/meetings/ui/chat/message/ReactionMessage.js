import React from 'react';

import { reactionsNativeEmojiMap, getLabel } from '~meetings/utils/reactions';
import { Tooltip } from '@common/ui/general';
import { toHHmm } from '@common/utils/date';

function ReactionMessage({ message }) {
  const reactionList = Object.keys(message.reactions).map(
    (type) => {
      const { count, names } = message.reactions[type];
      return (
        <Tooltip
          isDisabled={names.length === 0}
          component="div"
          title={getLabel(count, names)}
          popoverProps={{
            placement: 'top',
            className: 'tooltip message-reaction__tool-tip',
            extraScope: 'meeting-app',
          }}
          key={type}
        >
          <div className="message-reaction__item">
            <span aria-hidden="true">
              {reactionsNativeEmojiMap[type]}
            </span>
            <div className="h5 no-mgn-b m-l-5">
              {count}
            </div>
          </div>
        </Tooltip>
      );
    },
  );

  return (
    <>
      <div className="message-reaction__header">
        <div className="message-reaction__date">
          {toHHmm(message.timestamp)}
        </div>
      </div>
      <div className="message-reaction">
        {reactionList}
      </div>
    </>
  );
}
export default ReactionMessage;
