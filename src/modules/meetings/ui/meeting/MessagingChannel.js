import React from 'react';

import {
  ChatInput, ChatReactions, ChatWindow, NoticeBoardHandler,
} from '~meetings/ui/chat';
import { ChatNotification } from '~meetings/ui/settings';
import { CircularLoader } from '@common/ui/general';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { isMobile } from '@common/utils/platform';
import { LivePoll } from '~meetings/ui/polls';
import { LiveSurvey } from '~meetings/ui/survey';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaQuery } from '@common/hooks';
import MessagingChannelStatus from './MessagingChannelStatus';

function MessagingChannel({ meetingStore: store }) {
  const { mobile } = useMediaQuery();
  const { meeting } = store;
  const {
    manager, messaging, isMobilePanelExpanded, noticeBoard, isChatInputVisible,
  } = meeting;
  const newNoticeBoardEnabled = meeting.config?.newNoticeBoardEnabled;

  if (!messaging) {
    return null;
  } else if (
    messaging.isLoading
    || (messaging.messages.length === 0 && messaging.isLoadingMessages)
  ) {
    return <LoadingLayout />;
  } else if (messaging.loadError) {
    return (
      <HintLayout
        actionLabel="Try again"
        actionFn={() => messaging.join()}
        heading="Failed to load chat."
        message="Please try again or if you are using a work system,
        kindly switch to your personal laptop/desktop
        (there could be some applications blocking the chat
        on your work system)."
      />
    );
  } else if (messaging.isLoaded) {
    return (
      <div className="layout relative">
        {!mobile && (
          <ChatNotification
            className="p-10 border-bottom no-mgn-b"
            variant="compact"
          />
        )}
        <ChatWindow
          lastReadMessageIndex={messaging.lastReadMessageIndex}
          messages={messaging.messages}
          onLoadOldMessages={messaging.loadMessages}
          setLastReadMessageIndex={messaging.setLastReadMessageIndex}
          unreadMessageCount={messaging.unreadMessageCount}
          noticeBoard={
            !newNoticeBoardEnabled && mobile && !isMobilePanelExpanded ? null
              : (
                <NoticeBoardHandler
                  noticeBoard={noticeBoard}
                  canAdd={meeting.isSuperHost}
                  newNoticeBoardEnabled={newNoticeBoardEnabled}
                />
              )
          }
        />
        {manager.poll && manager.poll.isMinimized && <LivePoll />}
        {manager.survey && <LiveSurvey />}
        <ChatReactions />
        {isMobile() && !isChatInputVisible ? null : <ChatInput />}
        <MessagingChannelStatus />
        {messaging.isLoadingMessages && (
          <div className="chat-loader">
            <CircularLoader />
          </div>
        )}
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(MessagingChannel);
