import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import {
  Dropdown, EmojiPicker, Icon, Tappable, Textarea,
} from '@common/ui/general';
import { insertSubstring } from '@common/utils/string';
import { mobxify } from '~meetings/ui/hoc';
import { Select } from '~meetings/ui/general';
import { sendSubmitGTMEvent } from '@common/utils/gtm';
import { toCountdown } from '~video_player/utils/date';
import { useMediaQuery } from '@common/hooks';
import analytics from '@common/utils/analytics';
import HotKey from '@common/lib/hotKey';

function ChatInput({ meetingStore: store, settingsStore }) {
  const inputRef = useRef();
  const { mobile } = useMediaQuery();
  const { meeting } = store;
  const { messaging } = meeting;

  const handleFocus = useCallback(() => {
    messaging.setTyping(true);
  }, [messaging]);

  // Close emoji picker on unmount
  useEffect(() => () => messaging.setPickingEmoji(false)
    // eslint-disable-next-line
  , []);

  const handleChange = useCallback(({ target }) => {
    messaging.setMessageInput(target.value);
  }, [messaging]);

  const handleBlur = useCallback((event) => {
    messaging.setCursorPositon(event.target.selectionStart);
    messaging.setTyping(false);
  }, [messaging]);

  const handleEmojiSelect = useCallback((emoji) => {
    // Insert emoji into message
    const newMessage = insertSubstring(
      messaging.messageInput,
      emoji.colons,
      messaging.cursorPosition,
    );
    messaging.setMessageInput(newMessage);
    const newCursorPosition = messaging.cursorPosition + emoji.colons.length;
    inputRef.current.focusAtPosition(newCursorPosition);
    messaging.setPickingEmoji(false);
  }, [messaging]);

  const sendMessageEvent = useCallback(() => {
    if (messaging.messageInput && messaging.messageInput.length) {
      sendSubmitGTMEvent('chat', {
        lengthOfInput: messaging.messageInput.length,
        action: 'input_submit',
        category: 'drona',
      });
    }
  }, [messaging]);

  const handleKeyDown = useCallback((event) => {
    const hotKey = new HotKey(event);
    if (hotKey.didPress('enter') && !hotKey.didPress('shift+enter')) {
      event.preventDefault();
      sendMessageEvent();
      messaging.sendMessage();
    }
  }, [messaging, sendMessageEvent]);

  const handleToChange = useCallback(({ target }) => {
    messaging.setMessageToId(target.value);

    const inputEl = inputRef.current;
    if (inputEl) {
      inputEl.focus();
    }
  }, [messaging]);

  const handleSettingsOpen = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaReactionDisableSettingsButton,
      click_source: DRONA_SOURCES.meetingChatWindow,
      click_text: 'Enable/Disable Chat',
      click_feature: DRONA_FEATURES.meetingSettings,
    });
    settingsStore.setActiveTab('chat');
    settingsStore.setSettingsModalOpen(true);
  }, [settingsStore]);

  const onSendClick = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaSendChatMessage,
      click_source: DRONA_SOURCES.meetingMobileView,
      click_feature: DRONA_FEATURES.chat,
    });
    sendMessageEvent();
    messaging.sendMessage();
  }, [messaging, sendMessageEvent]);

  function toUi() {
    if (messaging.isPrivateEnabled) {
      return (
        <div className="chat-input__to">
          <span className="m-r-5">
            To:
          </span>
          <Select
            className="chat-input__select"
            name="messageToId"
            onChange={handleToChange}
            optionsPlacement="top"
            popoverProps={{
              extraScope: 'meeting-app',
              location: {
                left: 0,
                bottom: '100%',
              },
            }}
            small
            value={messaging.messageToId}
          >
            {messaging.sendToList.map(item => (
              <Select.Option
                key={item.value}
                value={item.value}
                className="chat-input__select-option"
              >
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      );
    } else {
      return null;
    }
  }

  function audienceControlUi() {
    if (meeting.isSuperHost) {
      return (
        <button
          type="button"
          className="h5 link normal"
          onClick={handleSettingsOpen}
        >
          Enable/Disable Chat
        </button>
      );
    } else {
      return null;
    }
  }

  function controlsUi() {
    return (
      <div className="chat-input__controls">
        <div className="chat-input__controls-left">
          {toUi()}
        </div>
        <div className="chat-input__controls-right hide-in-mobile">
          {audienceControlUi()}
        </div>
      </div>
    );
  }

  function dividerUi() {
    if (mobile && messaging.isPrivateEnabled) {
      return <div className="chat-input__divider" />;
    } else {
      return null;
    }
  }

  function emojiButtonUi() {
    return <Icon name="emoji" />;
  }

  function emojiUi() {
    return (
      <Dropdown
        isOpen={messaging.isPickingEmoji}
        onChange={messaging.setPickingEmoji}
        popoverProps={{
          extraScope: 'meeting-app',
          className: 'chat-input__emoji-popover',
          location: {
            right: 0,
            bottom: '110%',
          },
        }}
        title={emojiButtonUi}
        titleClassName="btn btn-icon btn-small btn-inverted"
        disabled={!messaging.canSendMessageDuringCooldown}
      >
        <EmojiPicker
          onSelect={handleEmojiSelect}
        />
      </Dropdown>
    );
  }

  function sendUi() {
    return (
      <Tappable
        className="btn btn-icon btn-small btn-primary m-l-5 show-in-mobile"
        onClick={onSendClick}
        disabled={!messaging.canSendMessageDuringCooldown}
      >
        <Icon name="send" />
      </Tappable>
    );
  }

  // eslint-disable-next-line no-unused-vars
  function notificationUi() {
    return (
      <Tappable
        className="btn btn-icon btn-small btn-inverted m-r-10 show-in-mobile"
        onClick={handleSettingsOpen}
      >
        <Icon name="bell" />
      </Tappable>
    );
  }

  function fieldUi() {
    return (
      <div className="chat-input__field">
        <Textarea
          ref={inputRef}
          className="chat-input__textarea"
          data-cy="meetings-sidebar-chat-input-area"
          gtmEventType="chat_input"
          gtmEventAction="focus"
          gtmEventCategory="drona"
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={
            messaging.canSendMessageDuringCooldown
              ? 'Type message'
              : `Type next message in ${toCountdown(
                messaging.chatRateLimitCountDown,
              )}`
          }
          value={messaging.messageInput}
          autoFocus
          disabled={!messaging.canSendMessageDuringCooldown}
        />
        {emojiUi()}
        {sendUi()}
      </div>
    );
  }

  function ui() {
    if (messaging.isEnabled) {
      return (
        <>
          {controlsUi()}
          {dividerUi()}
          {fieldUi()}
        </>
      );
    } else {
      return (
        <div className="chat-input__disabled">
          Chat has been disabled by host
        </div>
      );
    }
  }

  return (
    <div
      className={classNames(
        'layout__footer chat-input',
        { 'chat-input--focused': messaging.isTyping },
      )}
    >
      {ui()}
    </div>
  );
}

export default mobxify('meetingStore', 'settingsStore')(ChatInput);
