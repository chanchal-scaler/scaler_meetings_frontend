import React, { useEffect, useRef, useContext } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import {
  EventMessage,
  PollMessage,
  QuestionMessage,
  ReactionMessage,
  TextMessage,
} from './message';

import { isInViewport } from '@common/utils/dom';
import { MessageTypes } from '~meetings/utils/messaging';
import ChatContext from './context';

const messageRenderersMap = {
  [MessageTypes.event]: EventMessage,
  [MessageTypes.poll]: PollMessage,
  [MessageTypes.text]: TextMessage,
  [MessageTypes.proxyMessage]: TextMessage,
  [MessageTypes.reactions]: ReactionMessage,
  [MessageTypes.question]: QuestionMessage,
};

function ChatMessage({ index, message }) {
  const ref = useRef(null);
  const {
    isReadingOldMessages,
    lastReadMessageIndex,
    scrollTop,
    setLastReadMessageIndex,
  } = useContext(ChatContext);

  useEffect(() => {
    const messageEl = ref.current;
    if (
      messageEl
      && (lastReadMessageIndex < index)
      && isInViewport(messageEl)
    ) {
      setLastReadMessageIndex(index);
    }
  }, [
    index,
    isReadingOldMessages,
    lastReadMessageIndex,
    setLastReadMessageIndex,
    scrollTop,
  ]);

  function newMessageUi() {
    if (message.isFirstUnread) {
      return (
        <div className="chat-message__event chat-message__event--danger">
          <span>
            New
          </span>
        </div>
      );
    } else {
      return null;
    }
  }

  function ui() {
    const MessageRenderer = messageRenderersMap[message.type];
    if (MessageRenderer) {
      return <MessageRenderer message={message} />;
    } else {
      return null;
    }
  }

  return (
    <div
      ref={ref}
      className={classNames(
        'chat-message',
        { 'chat-message--reactions': message.type === MessageTypes.reactions },
      )}
      data-cy="meetings-chat-message"
    >
      {newMessageUi()}
      {ui()}
    </div>
  );
}

export default observer(ChatMessage);
