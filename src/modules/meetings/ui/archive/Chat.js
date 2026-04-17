import React from 'react';

import { ChatWindow, NoticeBoardHandler } from '~meetings/ui/chat';
import { mobxify } from '~meetings/ui/hoc';

function Chat({ meetingStore: store }) {
  const { archive } = store;
  const newNoticeBoardEnabled = archive.config?.newNoticeBoardEnabled;

  return (
    <ChatWindow
      isAutoPlay
      lastReadMessageIndex={archive.lastReadMessageIndex}
      messages={archive.messages}
      setLastReadMessageIndex={archive.setLastReadMessageIndex}
      unreadMessageCount={archive.unreadMessageCount}
      noticeBoard={(
        <NoticeBoardHandler
          noticeBoard={archive.noticeBoard}
          canAdd={false}
          newNoticeBoardEnabled={newNoticeBoardEnabled}
        />
      )}
    />
  );
}

export default mobxify('meetingStore')(Chat);
