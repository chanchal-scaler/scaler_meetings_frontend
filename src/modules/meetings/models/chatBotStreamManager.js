import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import camelCase from 'lodash/camelCase';

import { SocketStatus } from '~meetings/utils/meeting';
import chatBotStreamApi from '~meetings/api/chatBotStream';
import Socket from '@common/lib/socket';

const SOCKET_EVENTS = [
  'connecting', 'connected', 'disconnected', 'rejected', 'error',
  '_chatbot_stream_open', '_chatbot_stream_packet', '_chatbot_stream_end',
  '_chatbot_stream_error',
];

const CHATBOT_SLUG = 'drona-auto-responses-chatbot';

class ChatBotStreamManager {
  isConnected = false;

  status = SocketStatus.waiting;

  isStreamingMessage = false;

  currentMessage = null;

  // packet_id: message
  packets = {};

  constructor(meeting) {
    this._meeting = meeting;
    this._initialise();
    makeObservable(this, {
      chatStreamMessage: computed,
      currentMessage: observable,
      isConnected: observable,
      isStreaming: computed,
      isStreamingMessage: observable,
      packets: observable,
      resetChat: action,
      setStatus: action,
    });
  }

  resetChat() {
    this._handleChatbotStreamOpen();
  }

  setStatus(status) {
    if (status === SocketStatus.connected) {
      this.isConnected = true;
    } else {
      this.isConnected = false;
    }

    this.status = status;
  }

  _initialiseSocketConnection() {
    this._removeEventListeners();

    this._socket = new Socket(
      'ChatbotStreamChannel',
      {
        slug: CHATBOT_SLUG,
        chat_uid: this._chat_uid,
      },
    );
    this._addEventListeners();
  }

  get chatStreamMessage() {
    return this.currentMessage;
  }

  get isStreaming() {
    return this.isStreamingMessage;
  }

  get socket() {
    return this._socket;
  }

  /** Private Methods */

  _removeEventListeners() {
    if (this.socket) {
      SOCKET_EVENTS.forEach(eventName => {
        const handlerFnName = camelCase(`handle-${eventName}`);
        this.socket.off(eventName, this[`_${handlerFnName}`]);
      });
    }
  }

  _addEventListeners() {
    SOCKET_EVENTS.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);

      // To make sure that we never add more than one listener for every event
      this.socket.off(eventName, this[`_${handlerFnName}`]);
      this.socket.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _initialise = flow(function* () {
    this._setInitialState();
    yield this._initialiseChatSession();
    yield this._initialiseSocketConnection();
  });

  _setInitialState() {
    this.setStatus(SocketStatus.connecting);
  }

  _initialiseChatSession = flow(function* () {
    try {
      const { chat_uid: chatUid } = yield chatBotStreamApi.initChatStream();
      this._chat_uid = chatUid;
    } catch (error) {
      this.setStatus(SocketStatus.error);
    }
  });

  /** Event Handler Callbacks */

  _handleChatbotStreamOpen = () => {
    this.isStreamingMessage = true;
    this.currentMessage = '';
    this.packets = {};
  }

  _handleChatbotStreamPacket = (stream) => {
    const { data } = stream;

    // capture message only if streaming is active
    if (this.isStreamingMessage) {
      this.packets[data.packet_id] = data.message;
      // gets the message in order of packet_id
      this.currentMessage = Object.values(this.packets).join('');
    }
  }

  _handleChatbotStreamEnd = (stream) => {
    this.isStreamingMessage = false;
    const { data } = stream;

    this.currentMessage = data.message;
  }

  _handleChatbotStreamError() {
    this.setStatus(SocketStatus.error);
  }

  _handleConnecting = () => {
    this.setStatus(SocketStatus.connecting);
  }

  _handleConnected = () => {
    this.setStatus(SocketStatus.connected);
  }

  _handleDisconnected = () => {
    this.setStatus(SocketStatus.disconnected);
  }

  _handleError = () => {
    this.setStatus(SocketStatus.error);
  }

  _handleRejected = () => {
    this.setStatus(SocketStatus.rejected);
  }
}

export default ChatBotStreamManager;
