import React, { useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { HintLayout } from '@common/ui/layouts';
import ChatContext from './context';
import ChatMessage from './ChatMessage';
import ChatNotification from './ChatNotification';
import useChatScroll from './hooks/useChatScroll';

let ChatWindow = ({ noticeBoard }) => {
  const {
    handleScroll,
    isLoaded,
    messages,
    renderables,
    scrollRef,
  } = useChatScroll();

  function messageUi(index) {
    if (index < messages.length) {
      const message = messages[index];
      return (
        <ChatMessage
          key={index}
          message={message}
          index={index}
        />
      );
    } else {
      return null;
    }
  }

  function messagesUi() {
    if (renderables.length === 0) {
      return (
        <HintLayout
          isTransparent
          message="No messages yet"
        />
      );
    } else {
      return renderables.map(messageUi);
    }
  }

  return (
    <div
      className={classNames(
        'layout__content chat-window',
        { 'chat-window--loaded': isLoaded },
      )}
      data-cy="meetings-chat-window"
    >
      <div
        className="chat-window__messages"
        onScroll={handleScroll}
      >
        {noticeBoard}
        <div
          ref={scrollRef}
          className="chat-window__messages-container scroll"
        >
          {messagesUi()}
        </div>
      </div>
      <ChatNotification scrollRef={scrollRef} />
    </div>
  );
};

ChatWindow = observer(ChatWindow);

function ChatWindowProvider({
  isAutoPlay = false,
  lastReadMessageIndex,
  messages,
  onLoadOldMessages,
  setLastReadMessageIndex,
  unreadMessageCount,
  noticeBoard,
}) {
  const [isReadingOldMessages, setIsReadingOldMessages] = useState(false);
  const [scrollTop, setScrollTop] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        isAutoPlay,
        isReadingOldMessages,
        lastReadMessageIndex,
        messages,
        onLoadOldMessages,
        scrollTop,
        setIsReadingOldMessages,
        setLastReadMessageIndex,
        setScrollTop,
        unreadMessageCount,
      }}
    >
      <ChatWindow noticeBoard={noticeBoard} />
    </ChatContext.Provider>
  );
}

export default observer(ChatWindowProvider);
