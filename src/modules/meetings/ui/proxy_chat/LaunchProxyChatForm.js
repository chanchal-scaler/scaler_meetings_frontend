import React, { useCallback } from 'react';

import {
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { mobxify } from '~meetings/ui/hoc';
import { Modal } from '@common/ui/general';
import {
  PROXY_CHAT_MODAL_STATES,
  PROXY_CHAT_MODAL_TO_FEATURE_MAP,
} from '~meetings/utils/constants';
import analytics from '@common/utils/analytics';
import CustomChatForm from './CustomChatForm';
import ProxyChatIcon from '~meetings/images/custom-chat-icon.svg';
import TemplateChatForm from './TemplateChatForm';

const ModalContent = {
  [PROXY_CHAT_MODAL_STATES.customChat]: CustomChatForm,
  [PROXY_CHAT_MODAL_STATES.cueCardBasedChat]: TemplateChatForm,
  [PROXY_CHAT_MODAL_STATES.genericChat]: TemplateChatForm,
};

function LaunchProxyChatForm({ meetingStore: store }) {
  const { meeting } = store;
  const { proxyChatMessage } = meeting;

  const { modalState } = proxyChatMessage;

  const handleClose = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaProxyChatPopupCloseClick,
      click_source: DRONA_SOURCES.meetingProxyChatModal,
      click_feature: PROXY_CHAT_MODAL_TO_FEATURE_MAP[modalState],
    });

    proxyChatMessage.toggleFormOpen();
  }, [modalState, proxyChatMessage]);

  const titleText = modalState === PROXY_CHAT_MODAL_STATES.customChat
    ? 'Trigger a custom chat' : 'Trigger a Chat Message';

  const UiContent = () => {
    const Content = ModalContent[modalState];

    if (Content) {
      return <Content />;
    } else {
      return 'testing! Return Null Instead';
    }
  };

  return (
    <Modal
      isOpen={proxyChatMessage.formOpen}
      onClose={handleClose}
      unMountOnClose
      headerClassName="m-proxy-chat-form__header"
      className="m-proxy-chat-form"
      containerClassName="m-proxy-chat-form__body"
      title={(
        <div className="row align-c">
          <img
            src={ProxyChatIcon}
            alt="Custom Chat"
            className="m-proxy-chat-form-title"
          />
          {titleText}
        </div>
      )}
    >
      <UiContent />
    </Modal>
  );
}

export default mobxify('meetingStore')(LaunchProxyChatForm);
