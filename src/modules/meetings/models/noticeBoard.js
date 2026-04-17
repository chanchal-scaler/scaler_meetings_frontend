import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';

import { toast } from '@common/ui/general/Toast';
import { UserAuthenticationError } from '~meetings/errors';
import noticeBoardApi from '~meetings/api/noticeBoard';
import NoticeBoardMemo from '~meetings/models/noticeBoardMemo';

class NoticeBoard {
  messageInput = '';

  messages = [];

  isPinning = false;

  constructor(meeting, { messages }) {
    this._meeting = meeting;
    this._createNoticeBoardMemos(messages);
    makeObservable(this, {
      messages: observable,
      messageInput: observable,
      isPinning: observable,
      setNoticeBoardInput: action.bound,
      setNoticeBoardInputOpen: action.bound,
      messaging: computed,
    });
  }
  /* Public */

  addPinnedMessage(message) {
    this.messages.unshift(
      new NoticeBoardMemo(this.meeting, {
        fromId: String(message.user_id),
        createdAt: message.created_at,
        body: message.body,
        toId: String(message.to_id || -1),
        pinId: message.id,
      }),
    );
  }

  removePinnedMessage(id) {
    this.messages = this.messages.filter(message => message.pinId !== id);
  }

  setNoticeBoardInput(value) {
    this.messageInput = value;
  }

  // added for compatibility
  pinCustomMessage = () => null;

  pinMessage = flow(function* () {
    if (this.isPinning) return;

    this.isPinning = true;
    try {
      const response = yield noticeBoardApi.pinMessage(this.meeting.slug, {
        body: this.messageInput,
      });
      const messageData = {
        ...response.message,
        author: this.meeting.user,
      };
      this.messaging.sendEvent('new-pinned-message', {
        message: messageData,
      }, true);
      this.setNoticeBoardInput('');
      toast.show({
        message: 'Your message has been pinned',
        type: 'info',
      });
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        const message = 'Failed to pin message';
        toast.show({
          message,
          type: 'error',
        });
      }
    }
    this.isPinning = false;
  })

  unpinMessage = flow(function* (id) {
    try {
      yield noticeBoardApi.unpinMessage(this.meeting.slug, id);
      this.messaging.sendEvent('delete-pinned-message', {
        id,
      }, true);
      toast.show({
        message: 'Message unpinned',
        type: 'info',
      });
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        const message = 'Failed to unpin message';
        toast.show({
          message,
          type: 'error',
        });
      }
    }
  })

  get meeting() {
    return this._meeting;
  }

  get messaging() {
    return this.meeting.messaging;
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
