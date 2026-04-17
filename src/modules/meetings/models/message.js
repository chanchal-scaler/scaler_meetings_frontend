import MessageBase from './messageBase';

class Message extends MessageBase {
  constructor(channel, fromId, timestamp) {
    super(channel.meeting, fromId, timestamp);
    this._channel = channel;
  }

  get channel() {
    return this._channel;
  }

  get manager() {
    return this.meeting.manager;
  }
}

export default Message;
