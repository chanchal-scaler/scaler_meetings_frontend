import { MessageTypes } from '~meetings/utils/messaging';
import { toPercentages } from '~meetings/utils/number';
import Message from './message';

class PollMessage extends Message {
  constructor(channel, fromId, timestamp, data) {
    super(channel, fromId, timestamp);

    this._type = MessageTypes.poll;
    this._data = data;
  }

  /* Public */

  get choices() {
    return this.data.choices.map(o => o.text);
  }

  get data() {
    return this._data;
  }

  get description() {
    return this.data.description;
  }

  get distribution() {
    return toPercentages(this.data.choices.map(o => o.distribution));
  }

  get participationCount() {
    return this.data.participation_count;
  }

  get totalResponses() {
    return this.data.choices.reduce(
      (a, o) => a + o.distribution,
      0,
    );
  }
}

export default PollMessage;
