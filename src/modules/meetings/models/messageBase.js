import { action, makeObservable, observable } from 'mobx';

import { isSystemMessage } from '~meetings/utils/messaging';

class MessageBase {
  isFirstUnread = false;

  constructor(meeting, fromId, timestamp) {
    this._meeting = meeting;
    this._fromId = fromId;
    this._timestamp = timestamp;
    makeObservable(this, {
      isFirstUnread: observable,
      setFirstUnread: action.bound,
    });
  }

  setFirstUnread(isUnread) {
    this.isFirstUnread = isUnread;
  }

  get from() {
    return this.meeting.getParticipant(this.fromId);
  }

  get fromId() {
    return this._fromId;
  }

  get isFromSystem() {
    return isSystemMessage(this.type);
  }

  get isMine() {
    return !this.isFromSystem && this.from.isCurrentUser;
  }

  get meeting() {
    return this._meeting;
  }

  get timestamp() {
    return new Date(this._timestamp).getTime();
  }

  /**
   * Indicates the type of message i.e if it is 'text', 'event' etc.
   * Should be set in the subclass that extends this class.
   */
  get type() {
    return this._type;
  }

  get uid() {
    return `${this.timestamp}::${this.fromId}`;
  }
}

export default MessageBase;
