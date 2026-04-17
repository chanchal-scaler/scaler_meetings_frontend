import React, { useEffect } from 'react';
import classNames from 'classnames';

import {
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import {
  Icon, SegmentedControl, SegmentedControlOption, Tappable,
} from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { PROXY_CHAT_MODAL_STATES } from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';
import CueCardChatContent from './CueCardChatContent';
import GenericChatContent from './GenericChatContent';

const PROXY_CHAT_TABS = [
  {
    label: 'Generic Chats',
    name: PROXY_CHAT_MODAL_STATES.genericChat,
  }, {
    label: 'Cue Card Based Chat',
    name: PROXY_CHAT_MODAL_STATES.cueCardBasedChat,
  },
];

function TemplateChatFrom({
  meetingStore: store,
}) {
  const { meeting } = store;
  const { proxyChatMessage } = meeting;
  const {
    modalState,
    isCueCardBasedChatEnabled,
  } = proxyChatMessage;

  const handleTabChange = (value) => {
    proxyChatMessage.setModalState(value);
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyChatTabChangeClick,
      click_source: DRONA_SOURCES.meetingProxyChatModal,
      custom: {
        currentTab: value,
      },
    });
  };

  useEffect(() => {
    if (modalState === PROXY_CHAT_MODAL_STATES.genericChat) {
      proxyChatMessage.fetchGenericChatTemplates();
    }
  }, [modalState, proxyChatMessage]);

  const showOptionDot = (name) => name === PROXY_CHAT_MODAL_STATES
    .cueCardBasedChat
    && isCueCardBasedChatEnabled;

  return (
    <div className="flex flex-col m-proxy-chat-form-template">
      <Tappable
        className={classNames(
          'btn btn-primary btn-long btn-outlined btn-rounded',
          'm-proxy-chat-form-template__custom_message_cta',
        )}
        onClick={() => handleTabChange(PROXY_CHAT_MODAL_STATES.customChat)}
      >
        <span>Create a Custom Message</span>
        <Icon name="pencil" />
      </Tappable>
      <div className="m-proxy-chat-form-template__or_seperator">
        <span className="m-proxy-chat-form-template__or_seperator--line" />
        <span>OR</span>
        <span className="m-proxy-chat-form-template__or_seperator--line" />
      </div>
      <SegmentedControl
        className="m-proxy-chat-form-template__tabs"
        activeClassName="m-proxy-chat-form-template__tabs--active"
        onChange={handleTabChange}
        value={modalState}
      >
        {PROXY_CHAT_TABS.map((item) => (
          <SegmentedControlOption
            key={item.name}
            className="m-proxy-chat-form-template__tabs__title"
            name={item.name}
          >
            <span>{item.label}</span>
            {showOptionDot(item.name) && (
              <span className="m-proxy-chat-form-template--dot" />
            )}
          </SegmentedControlOption>
        ))}
      </SegmentedControl>

      {modalState === PROXY_CHAT_MODAL_STATES.genericChat && (
        <GenericChatContent />
      )}
      {modalState === PROXY_CHAT_MODAL_STATES.cueCardBasedChat && (
        <CueCardChatContent />
      )}
    </div>
  );
}

export default mobxify('meetingStore')(TemplateChatFrom);
