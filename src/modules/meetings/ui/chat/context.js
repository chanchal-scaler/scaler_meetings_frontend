import { createContext } from 'react';

const ChatContext = createContext({
  lastReadMessageIndex: -1,
  setLastReadMessageIndex: () => { },
});

export default ChatContext;
