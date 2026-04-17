import { computed, makeObservable } from 'mobx';
import pickBy from 'lodash/pickBy';

import { isNullOrUndefined } from '@common/utils/type';
import { MessageTypes } from '~meetings/utils/messaging';
import { transformData } from '~meetings/utils/reactions';
import MessageBase from './messageBase';

class ArchivedMessage extends MessageBase {
  constructor(archive, fromId, timestamp, data) {
    super(archive, fromId, timestamp);
    this._data = data;
    this._type = data.type || MessageTypes.text;
    makeObservable(this, {
      fromLabel: computed,
    });
  }

  get body() {
    if (this.isProxyMessage) {
      return this.proxyMessageContent;
    }
    return this.data.body;
  }

  get data() {
    return this._data;
  }

  get isPinned() {
    return Boolean(this.data.pinned);
  }

  get proxyUserName() {
    // split body based on delimiter :::
    const nameAndBody = this.data.body.split(':::');
    return nameAndBody[0];
  }

  get proxyMessageContent() {
    // split body based on delimiter :::
    const nameAndBody = this.data.body.split(':::');
    return nameAndBody[1];
  }

  get isProxyMessage() {
    return Boolean(this.data.type === MessageTypes.proxyMessage);
  }

  get fromLabel() {
    if (this.isProxyMessage) {
      return this.proxyUserName;
    } else if (this.isMine) {
      return 'You';
    } else {
      return this.from.shortName;
    }
  }

  get isPublic() {
    return isNullOrUndefined(this.toId) || this.toId === '-1';
  }

  /**
   * Returns reactions which have > 0 responses
   */
  get reactions() {
    let data = {};
    try {
      data = JSON.parse(this.body);
      data = transformData(data);
    } catch (error) {
      // Ignore
    }
    return pickBy(data.reactions || {}, (value) => value.count > 0);
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

export default ArchivedMessage;
