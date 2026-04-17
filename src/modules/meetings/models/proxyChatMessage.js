import { toast } from '@common/ui/general/Toast';
import {
  makeObservable, observable, action, computed,
  flow,
} from 'mobx';

import { PROXY_CHAT_MODAL_STATES } from '~meetings/utils/constants';
import proxyMessageApi from '~meetings/api/proxyMessage';

const TIMEOUT = 20000;

class ProxyChatMessage {
  formOpen = false;

  isFetchingUserName = false;

  isSendingMessage = false;

  message = '';

  userName = '';

  modalState = PROXY_CHAT_MODAL_STATES.genericChat;

  genericChatTemplates = [];

  isFetchingTemplates = false;

  isRegeneratingMessage = false;

  isCueCardBasedChatEnabled = false;

  cueCardTemplates = [];

  isCueBasedTriggerVisible = false;

  constructor(meeting) {
    this._meeting = meeting;
    makeObservable(this, {
      activeCueCardInfo: computed,
      cueCardTemplates: observable,
      formOpen: observable,
      fetchGenericChatTemplates: action.bound,
      fetchUserName: action.bound,
      genericChatTemplates: observable,
      handleUpdateTemplateUserName: action.bound,
      handleRegenerateTemplateMessage: action.bound,
      isCueCardBasedChatEnabled: observable,
      isCueBasedTriggerVisible: observable,
      isFetchingTemplates: observable,
      isFetchingUserName: observable,
      isRegeneratingMessage: observable,
      isSendingMessage: observable,
      meeting: computed,
      message: observable,
      modalState: observable,
      regenerateMessage: action.bound,
      sendProxyMessage: action.bound,
      setModalState: action.bound,
      toggleFormOpen: action.bound,
      userName: observable,
    });
  }

  fetchGenericChatTemplates = flow(function* () {
    if (this.isFetchingTemplates || this.genericChatTemplates.length) return;
    this.isFetchingTemplates = true;

    try {
      const { data } = yield proxyMessageApi.getGenericProxyMessages(
        this.meeting.slug,
      );
      this.genericChatTemplates = data;
    } catch (error) {
      toast.show({
        message: error?.responseJson?.message || 'Error fetching templates',
        type: 'error',
      });
    }
    this.isFetchingTemplates = false;
  });

  fetchUserName = flow(function* () {
    if (this.isFetchingUserName) return;

    this.isFetchingUserName = true;
    try {
      const { data } = yield proxyMessageApi.getRandomName();
      this.setUserName(data);
    } catch (error) {
      toast.show({
        message: error?.responseJson?.message || 'Error fetching username',
        type: 'error',
      });
    }
    this.isFetchingUserName = false;
  });

  handleEnableCueBasedTrigger = () => {
    this.setCueBasedTriggerVisible(true);

    clearTimeout(this._cueCardTimeout);
    this._cueCardTimeout = setTimeout(() => {
      this.setCueBasedTriggerVisible(false);
    }, TIMEOUT);
  }

  handleEnableCueCardBasedChat = (cueCardTemplates) => {
    this.isCueCardBasedChatEnabled = true;
    this.cueCardTemplates = cueCardTemplates;

    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      this.setCueBasedTriggerVisible(true);
    }, TIMEOUT);
  }

  handleDisableCueCardBasedChat = () => {
    this.isCueCardBasedChatEnabled = false;
    this.cueCardTemplates = [];
  }

  handleRegenerateTemplateMessage = flow(function* (templateType, index) {
    yield this.regenerateMessage(this.templatesByType(templateType)[index]
      .proxy_message);

    if (this.message) {
      this.templatesByType(templateType)[index].proxy_message = this.message;
    }
  });

  handleUpdateTemplateUserName = flow(function* (templateType, index) {
    yield this.fetchUserName();

    if (this.userName) {
      this.templatesByType(templateType)[index].proxy_user_name = this.userName;
    }
  })

  regenerateMessage = flow(function* (message) {
    if (this.isRegeneratingMessage) return;

    this.isRegeneratingMessage = true;

    try {
      const { data } = yield proxyMessageApi.regenerateMessage(
        this.meeting.slug,
        message,
        this.modalState === PROXY_CHAT_MODAL_STATES.genericChat ? 'generic'
          : 'cue_based',
        this.activeCueCardInfo.type,
        this.activeCueCardInfo.id,
      );
      this.setMessage(data.proxy_message);
    } catch (error) {
      toast.show({
        message: error?.responseJson?.message || 'Error regenerating message',
        type: 'error',
      });
    }

    this.isRegeneratingMessage = false;
  });

  sendProxyMessage = flow(function* () {
    if (this.isSendingDisabled) return;

    this.isSendingMessage = true;

    try {
      yield proxyMessageApi.sendMessage(
        this.meeting.slug,
        this.userName,
        this.message,
      );
      toast.show({ message: 'Message sent!', type: 'success' });
      this.toggleFormOpen();
    } catch (error) {
      toast.show({
        message: error?.responseJson?.message || 'Error sending message',
        type: 'error',
      });
    }

    this.isSendingMessage = false;
  });

  setUserName(userName) {
    this.userName = userName;
  }

  setMessage(message) {
    this.message = message;
  }

  setModalState(value) {
    this.modalState = value;

    if (value === PROXY_CHAT_MODAL_STATES.cueCardBasedChat) {
      // Disable the timeout popover as the modal is open
      clearTimeout(this._cueCardTimeout);
      clearTimeout(this._timeout);
    }
  }

  setCueBasedTriggerVisible(value) {
    this.isCueBasedTriggerVisible = value;
  }

  toggleFormOpen(state = PROXY_CHAT_MODAL_STATES.genericChat) {
    this.formOpen = !this.formOpen;
    this.setModalState(state);
  }

  templatesByType(type) {
    return type === 'generic' ? this.genericChatTemplates
      : this.cueCardTemplates;
  }

  get isSendingDisabled() {
    return !this.userName || !this.message || this.isSendingMessage;
  }

  get meeting() {
    return this._meeting;
  }

  get activeCueCardInfo() {
    if (this.meeting?.playlist?.activeContent?._data) {
      return {
        id: this.meeting.playlist.activeContent._data.content_id,
        type: this.meeting.playlist.activeContent._data.content_type,
        name: this.meeting.playlist.activeContent._data.name,
      };
    }
    return {};
  }
}

export default ProxyChatMessage;
