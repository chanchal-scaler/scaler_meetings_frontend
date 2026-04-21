import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';

import { logEvent } from '@common/utils/logger';
import { MessageTypes } from '~meetings/utils/messaging';
import { toast } from '@common/ui/general/Toast';
import { UserAuthenticationError } from '~meetings/errors';
import noticeBoardApi from '~meetings/api/noticeBoard';
import NoticeBoardMemo from '~meetings/models/noticeBoardMemo';

class NoticeBoard {
  formOpen = false;

  messageTitle = '';

  messageDescription = '';

  messageLink = ''

  messages = [];

  unreadMessageIds = [];

  isPinning = false;

  templates = [];

  currentTemplateSlug = null;

  isLoadingTemplates = false;

  hasLoadedTemplates = false;

  constructor(meeting, { messages }) {
    this._meeting = meeting;
    this._createNoticeBoardMemos(messages);
    makeObservable(this, {
      messages: observable,
      messageTitle: observable,
      messageDescription: observable,
      messageLink: observable,
      isPinning: observable,
      unreadMessageIds: observable,
      formOpen: observable,
      setNoticeBoardMessageTitle: action.bound,
      setNoticeBoardMessageDescription: action.bound,
      setNoticeBoardMessageLink: action.bound,
      resetUnreadMessageCount: action.bound,
      setFormOpen: action.bound,
      resetFormState: action.bound,
      messaging: computed,
      unreadMessageCount: computed,
      templates: observable,
      currentTemplate: computed,
      currentTemplateSlug: observable,
      isLoadingTemplates: observable,
      hasLoadedTemplates: observable,
      setTemplates: action.bound,
      setCurrentTemplateSlug: action,
      updateTemplate: action.bound,
    });
  }

  setTemplates(data) {
    this.templates = data;
  }

  updateTemplate(slug, data) {
    const templateIndex = this.templates.findIndex(
      (template) => template.slug === slug,
    );
    if (templateIndex !== -1) {
      this.templates = this.templates.map((template, index) => (
        index === templateIndex ? data : template
      ));
    }
  }

  setCurrentTemplateSlug(templateSlug) {
    this.currentTemplateSlug = templateSlug;
  }

  setNoticeBoardMessageTitle(value) {
    this.messageTitle = value;
  }

  setNoticeBoardMessageDescription(value) {
    this.messageDescription = value;
  }

  setNoticeBoardMessageLink(value) {
    this.messageLink = value;
  }

  setFormOpen(value) {
    this.formOpen = value;
  }

  resetUnreadMessageCount() {
    this.unreadMessageIds = [];
  }

  resetFormState() {
    this.messageLink = '';
    this.messageDescription = '';
    this.messageTitle = '';
  }

  addPinnedMessage(message) {
    const nextMessage = new NoticeBoardMemo(this.meeting, {
        fromId: String(message.user_id),
        createdAt: message.created_at,
        body: message.body,
        toId: String(message.to_id || -1),
        pinId: message.id,
      });
    this.messages = [nextMessage, ...this.messages];
    this.unreadMessageIds = [...this.unreadMessageIds, message.id];
    window.dispatchEvent(
      new CustomEvent('NOTICE_BOARD_MESSAGE_ADDED_EVENT'),
    );
  }

  removePinnedMessage(id) {
    this.messages = this.messages.filter(message => message.pinId !== id);
    this.unreadMessageIds = this.unreadMessageIds.filter(
      (messageId) => messageId !== id,
    );
  }

  pinCustomMessage = flow(function* (body) {
    if (this.isPinning) return;

    this.isPinning = true;

    try {
      const response = yield noticeBoardApi.pinMessage(this.meeting.slug, {
        message_type: MessageTypes.noticeBoard,
        body,
      });
      const message = {
        ...response.message,
        author: this.meeting.user,
      };
      this.messaging.sendEvent('new-pinned-message', { message }, true);
      toast.show({
        message: 'Message successfully added to notice board',
        type: 'info',
      });
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        const message = 'Failed to add message to notice board';
        toast.show({ message, type: 'error' });
      }
    }
    this.setFormOpen(false);
    this.isPinning = false;
  });

  pinMessage = flow(function* () {
    if (this.isPinning) return;

    this.isPinning = true;
    try {
      const response = yield noticeBoardApi.pinMessage(this.meeting.slug, {
        message_type: MessageTypes.noticeBoard,
        body: {
          title: this.messageTitle,
          description: this.messageDescription,
          cta_link: this.messageLink,
          cta_title: 'Open Link',
        },
      });
      const messageData = {
        ...response.message,
        author: this.meeting.user,
      };
      this.messaging.sendEvent('new-pinned-message', {
        message: messageData,
      }, true);
      this.resetFormState();
      toast.show({
        message: 'Message successfully added to notice board',
        type: 'info',
      });
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        const message = 'Failed to add message to notice board';
        toast.show({
          message,
          type: 'error',
        });
      }
    }
    this.setFormOpen(false);
    this.isPinning = false;
  })

  unpinMessage = flow(function* (id) {
    try {
      yield noticeBoardApi.unpinMessage(this.meeting.slug, id);
      this.messaging.sendEvent('delete-pinned-message', {
        id,
      }, true);
      toast.show({
        message: 'Message successfully deleted',
        type: 'info',
      });
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        const message = 'Failed to delete message';
        toast.show({
          message,
          type: 'error',
        });
      }
    }
  })

  loadTemplates = flow(function* (slug) {
    if (this.isLoadingTemplates) {
      return;
    }

    this.isLoadingTemplates = true;
    try {
      const json = yield noticeBoardApi.fetchTemplates(slug);
      if (json.templates) {
        this.setTemplates(...json.templates);
      }
    } catch (error) {
      logEvent('error', 'NoticeBoardError: Failed to load templates', error);
      throw error;
    }
    this.isLoadingTemplates = false;
    this.hasLoadedTemplates = true;
  });

  get meeting() {
    return this._meeting;
  }

  get messaging() {
    return this.meeting.messaging;
  }

  get unreadMessageCount() {
    return this.unreadMessageIds.length;
  }

  get currentTemplate() {
    return this.templates.find(
      (template) => template.slug === this.currentTemplateSlug,
    );
  }

  /* Private methods */

  _createNoticeBoardMemos(messages) {
    const newMessages = messages.map((message) => (
      new NoticeBoardMemo(this.meeting, {
        fromId: String(message.user_id),
        createdAt: message.created_at,
        body: message.body,
        toId: String(message.to_id || -1),
        pinId: message.id,
      })
    ));
    this.messages = newMessages;
  }
}

export default NoticeBoard;
