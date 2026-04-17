/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { NotImplementedError } from '@common/errors';
import _BaseInterface from './_base.interface';

class MessagingInterface extends _BaseInterface {
  // Public exposed methods

  async isDeviceSupported() {
    return true;
  }

  async join() {
    throw new NotImplementedError('join');
  }

  async destroy() {
    throw new NotImplementedError('destroy');
  }

  async getMembersStatus() {
    throw new NotImplementedError('getMembersStatus');
  }

  async sendMessage(body, author, userId = null) {
    throw new NotImplementedError('sendMessage');
  }

  async sendEvent(eventType, eventData, emit = false) {
    throw new NotImplementedError('sendEvent');
  }

  setUser(user) {
    throw new NotImplementedError('setUser');
  }

  async getUser(userId) {
    throw new NotImplementedError('getUser');
  }
}

export default MessagingInterface;
