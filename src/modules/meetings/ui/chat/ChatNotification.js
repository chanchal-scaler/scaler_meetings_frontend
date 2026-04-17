import React, { useCallback, useContext } from 'react';
import { observer } from 'mobx-react';
import pluralize from 'pluralize';

import { Icon, Tappable } from '@common/ui/general';
import ChatContext from './context';
import { scrollTo } from '@common/utils/dom';

function ChatNotification({ scrollRef }) {
  const {
    isReadingOldMessages,
    unreadMessageCount,
  } = useContext(ChatContext);

  const handleClick = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      const maxScrollTop = scrollEl.scrollHeight - scrollEl.clientHeight;
      scrollTo(maxScrollTop, null, scrollEl);
    }
  }, [scrollRef]);

  if (isReadingOldMessages && unreadMessageCount > 0) {
    return (
      <Tappable
        className="btn btn-warning btn-small chat-notification"
        onClick={handleClick}
      >
        <Icon
          name="arrow-down"
          className="m-r-5"
        />
        <span>
          {unreadMessageCount}
          {' '}
          new
          {' '}
          {pluralize('message', unreadMessageCount)}
        </span>
      </Tappable>
    );
  } else {
    return null;
  }
}

export default observer(ChatNotification);
