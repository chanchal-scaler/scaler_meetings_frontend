import { computed, makeObservable } from 'mobx';

import { MessageTypes } from '~meetings/utils/messaging';
import Message from './message';

export const EventTypes = {
  joined: 'joined',
  left: 'left',
};

class EventMessage extends Message {
  constructor(channel, fromId, timestamp, eventType) {
    super(channel, fromId, timestamp);

    this._type = MessageTypes.event;
    this._name = eventType;
    makeObservable(this, {
      body: computed,
    });
  }

  get body() {
    switch (this.name) {
      case EventTypes.joined:
        return `${this.from.name} has joined`;
      case EventTypes.left:
        return `${this.from.name} has left`;
      default:
        return null;
    }
  }

  get name() {
    return this._name;
  }
}

export default EventMessage;
