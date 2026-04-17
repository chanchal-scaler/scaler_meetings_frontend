import { MessageTypes } from '~meetings/utils/messaging';
import Message from './message';

class QuestionMessage extends Message {
  constructor(channel, fromId, timestamp, question) {
    super(channel, fromId, timestamp);

    this._type = MessageTypes.question;
    this._question = question;
  }

  get question() {
    return this._question;
  }
}

export default QuestionMessage;
