import React, { useCallback } from 'react';
import classNames from 'classnames';

import { Accordion, Icon, Tappable } from '@common/ui/general';
import {
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { mobxify } from '~meetings/ui/hoc';
import { PROXY_CHAT_MODAL_TO_FEATURE_MAP } from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';

function ProxyMessageAccordian({
  content,
  isOpen,
  templateId,
  handleUpdateTemplate,
  meetingStore: store,
  templateType,
}) {
  const { proxyChatMessage } = store.meeting;
  const {
    isFetchingUserName,
    isRegeneratingMessage,
    isSendingMessage,
    modalState,
  } = proxyChatMessage;

  const handleSendMessage = useCallback(() => {
    proxyChatMessage.setUserName(content.proxy_user_name);
    proxyChatMessage.setMessage(content.proxy_message);
    proxyChatMessage.sendProxyMessage();

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyChatSendCtaClick,
      click_source: DRONA_SOURCES.meetingProxyChatModal,
      click_feature: PROXY_CHAT_MODAL_TO_FEATURE_MAP[modalState],
      custom: {
        message: content.proxy_message,
        userName: content.proxy_user_name,
      },
    });
  }, [content.proxy_message, content.proxy_user_name,
    modalState, proxyChatMessage]);

  const handleUpdateUserName = useCallback(() => {
    proxyChatMessage.handleUpdateTemplateUserName(templateType, templateId);

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyChatRandomiseNameClick,
      click_source: DRONA_SOURCES.meetingProxyChatModal,
      click_feature: PROXY_CHAT_MODAL_TO_FEATURE_MAP[modalState],
    });
  }, [modalState, proxyChatMessage, templateId, templateType]);

  const handleUpdateMessage = useCallback(() => {
    proxyChatMessage.handleRegenerateTemplateMessage(templateType, templateId);

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyChatRandomiseMessageClick,
      click_source: DRONA_SOURCES.meetingProxyChatModal,
      click_feature: PROXY_CHAT_MODAL_TO_FEATURE_MAP[modalState],
    });
  }, [modalState, proxyChatMessage, templateId, templateType]);

  const handleAccordianClick = useCallback(() => {
    handleUpdateTemplate(templateId);

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyChatSelectMessageClick,
      click_source: DRONA_SOURCES.meetingProxyChatModal,
      click_feature: PROXY_CHAT_MODAL_TO_FEATURE_MAP[modalState],
      custom: {
        message: content.proxy_message,
      },
    });
  }, [content.proxy_message, handleUpdateTemplate, modalState, templateId]);

  const HeaderUI = ({ active, ...props }) => (
    <div className="m-proxy-chat-form-accordian__header" {...props}>
      {!active ? (
        <span>{content.proxy_message}</span>
      ) : (
        <span>
          Message:
          {' '}
          <b>{content.proxy_message}</b>
        </span>
      )}
      <Icon
        className="m-proxy-chat-form-accordian__icon"
        name={isOpen ? 'chevron-up' : 'chevron-down'}
      />
    </div>
  );

  if (!content.proxy_message || !content.proxy_user_name) {
    return null;
  } else {
    return (
      <Accordion
        title={HeaderUI}
        isOpen={isOpen}
        onClick={handleAccordianClick}
        className="m-proxy-chat-form-accordian"
      >
        <>
          <span>
            User:
            {' '}
            <b>{content.proxy_user_name}</b>
          </span>
          <div className="m-proxy-chat-form-accordian__cta_group">
            <Tappable
              className={classNames(
                'btn btn-primary btn-outlined btn-rounded',
                'm-proxy-chat-form-accordian__action_btn',
              )}
              disabled={isRegeneratingMessage}
              onClick={handleUpdateMessage}
            >
              Regenerate Message
            </Tappable>
            <Tappable
              className={classNames(
                'btn btn-primary btn-outlined btn-rounded',
                'm-proxy-chat-form-accordian__action_btn',
              )}
              disabled={isFetchingUserName}
              onClick={handleUpdateUserName}
            >
              Randomize Username
            </Tappable>
          </div>
          <Tappable
            className={classNames(
              'btn btn-primary btn-rounded',
              'm-proxy-chat-form-accordian__btn',
            )}
            onClick={handleSendMessage}
            disabled={isSendingMessage}
          >
            Send
          </Tappable>
        </>
      </Accordion>
    );
  }
}

export default mobxify('meetingStore')(ProxyMessageAccordian);
