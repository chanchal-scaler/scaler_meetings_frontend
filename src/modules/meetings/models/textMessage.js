import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';

import { isNullOrUndefined } from '@common/utils/type';
import { logEvent } from '@common/utils/logger';
import { MessageTypes } from '~meetings/utils/messaging';
import { toast } from '@common/ui/general/Toast';
import { UserAuthenticationError } from '~meetings/errors';
import Message from './message';

class TextMessage extends Message {
  isSent = false;

  isSending = false;

  sendError = null;

  constructor(channel, fromId, timestamp, data, isLocal = false) {
    super(channel, fromId, timestamp);

    this._type = MessageTypes.text;
    this._data = data;
    this._isLocal = isLocal;
    this.send();
    makeObservable(this, {
      fromLabel: computed,
      isSending: observable,
      sendError: observable.ref,
      toLabel: computed,
      updateMessageType: action.bound,
    });
  }

  /* Public */

  send = flow(function* () {
    if (!this.isLocal || this.isSent || this.isSending) return;

    this.isSending = true;
    this.sendError = null;

    try {
      yield this.channel.client.sendMessage(
        this.body,
        this.from.data, // Author data like name, avatar etc.
        this.toId,
        this.currentTime,
      );

      // Send Message to our server
      this.manager.saveMessage({
        to_id: this.toId,
        body: this.body,
        timestamp: this.timestamp,
      });
      this.isSent = true;
    } catch (error) {
      this.sendError = error;
      logEvent(
        'error',
        'Messaging: Failed to send message',
        error,
      );
    }

    this.isSending = false;
  })

  delete = flow(function* () {
    if (this.isSent || this.isSending) return;

    this.isSending = true;
    this.sendError = null;

    const { uid: id } = this;
    try {
      this.meeting.messaging.sendEvent(
        'delete-text-message',
        { id },
        true,
      );
      this.manager.saveMessage({
        to_id: this.toId,
        body: this.body,
        timestamp: this.timestamp,
        participant_id: this.from.id,
        from_id: this.isProxyMessage ? null : this.from.userId,
      }, true);
      yield;
      toast.show({
        message: 'Message has been deleted',
        type: 'info',
      });
    } catch (error) {
      if (!(error instanceof UserAuthenticationError)) {
        this.sendError = error;
        const message = 'Failed to delete message';
        toast.show({
          message,
          type: 'error',
        });
      }
    }
    this.isSending = false;
  });

  updateMessageType(type) {
    this._type = type;
  }

  get fromLabel() {
    if (this.isProxyMessage) {
      return this.data.proxyUserName || this.proxyUserName;
    } else if (this.isMine) {
      return 'You';
    } else {
      return this.from.shortName;
    }
  }

  get fromProxyUser() {
    return this.isProxyMessage;
  }

  get body() {
    if (this.isProxyMessage) {
      return this.proxyMessageContent;
    }
    return this.data.body;
  }

  get proxyUserName() {
    // split body based on delimiter :::
    const nameAndBody = this.data.body.split(':::');
    return nameAndBody[0];
  }

  get proxyMessageContent() {
    if (this.data.proxyUserName) {
      // directly return body if it's stored through socket
      return this.data.body;
    }
    // split body based on delimiter :::
    const nameAndBody = this.data.body.split(':::');
    return nameAndBody[1];
  }

  get isProxyMessage() {
    return Boolean(this.data.type === MessageTypes.proxyMessage);
  }

  get data() {
    return this._data;
  }

  get isPinned() {
    return Boolean(this.data.pinned);
  }

  get isLocal() {
    return this._isLocal;
  }

  get isPublic() {
    return isNullOrUndefined(this.toId) || this.toId === '-1';
  }

  get to() {
    if (this.isPublic) {
      return null;
    } else {
      return this.meeting.getParticipant(this.toId);
    }
  }

  get toId() {
    return this.data.toId;
  }

  get currentTime() {
    return this.data.currentTime;
  }

  get toLabel() {
    if (!this.to) {
      return 'Everyone';
    } else if (this.isMine) {
      return this.to.shortName;
    } else {
      return 'Me';
    }
  }
}

export default TextMessage;
