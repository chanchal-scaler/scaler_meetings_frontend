import pickBy from 'lodash/pickBy';

import { MessageTypes } from '~meetings/utils/messaging';
import { transformData } from '~meetings/utils/reactions';
import Message from './message';

class ReactionsMessage extends Message {
  constructor(channel, fromId, timestamp, data) {
    super(channel, fromId, timestamp);

    this._type = MessageTypes.reactions;
    this._data = transformData(data);
  }

  get data() {
    return this._data;
  }

  /**
   * Returns reactions which have > 0 responses
   */
  get reactions() {
    return pickBy(this._data.reactions, (value) => value.count > 0);
  }
}

export default ReactionsMessage;
