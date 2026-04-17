import React, { useCallback } from 'react';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';

function CustomChatForm({ meetingStore: store }) {
  const { meeting } = store;
  const { proxyChatMessage } = meeting;

  const {
    userName,
    message,
    isSendingDisabled,
    isFetchingUserName,
  } = proxyChatMessage;

  const handleRandomizeName = useCallback(() => {
    proxyChatMessage.fetchUserName();

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyChatRandomiseNameClick,
      click_source: DRONA_SOURCES.meetingProxyChatModal,
      click_feature: DRONA_FEATURES.proxyCustomChat,
    });
  }, [proxyChatMessage]);

  const handleSendProxyMessage = useCallback(() => {
    proxyChatMessage.sendProxyMessage();

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyChatSendCtaClick,
      click_source: DRONA_SOURCES.meetingProxyChatModal,
      click_feature: DRONA_FEATURES.proxyCustomChat,
      custom: {
        message,
        userName,
      },
    });
  }, [proxyChatMessage, message, userName]);

  return (
    <>
      {!userName && (
        <label
          className="m-proxy-chat-form-placeholder"
          htmlFor="m-proxy-chat-form-username"
        >
          <Icon
            name="alphabet"
            className="m-proxy-chat-form-placeholder__icon"
          />
          Enter Username
        </label>
      )}
      <input
        className="m-proxy-chat-form-input"
        id="m-proxy-chat-form-username"
        placeholder=""
        value={userName}
        onChange={(e) => proxyChatMessage.setUserName(e.target.value)}
      />
      <Tappable
        className="btn btn-primary btn-outlined btn-rounded m-t-20"
        onClick={handleRandomizeName}
        disabled={isFetchingUserName}
      >
        <Icon name="swap" className="m-r-10" />
        Randomize
      </Tappable>
      {!message && (
        <label
          className="
            m-proxy-chat-form-placeholder
            m-proxy-chat-form-placeholder--description
          "
          htmlFor="m-proxy-chat-form-description"
        >
          <Icon
            name="left-align"
            className="m-proxy-chat-form-placeholder__icon"
          />
          Type the message here
        </label>
      )}
      <textarea
        type="text"
        required
        rows={5}
        id="m-proxy-chat-form-description"
        onChange={(e) => proxyChatMessage.setMessage(e.target.value)}
        className="
          m-proxy-chat-form-input m-proxy-chat-form-input--description
        "
        value={message}
      />
      <Tappable
        className="btn btn-primary btn-large m-proxy-chat-form__cta"
        disabled={isSendingDisabled}
        onClick={handleSendProxyMessage}
      >
        Send
      </Tappable>
    </>
  );
}

export default mobxify('meetingStore')(CustomChatForm);
