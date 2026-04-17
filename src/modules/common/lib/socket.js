import { createConsumer } from '@rails/actioncable';
import intersection from 'lodash/intersection';

import { generateUUID } from '@common/utils/misc';
import { isObject } from '@common/utils/type';
import { logEvent } from '@common/utils/logger';
import EventEmitter from '@common/lib/eventEmitter';
import SocketError from '../errors/socketError';

let socketTokenResolver = null;

function getMetaToken() {
  const meta = document.querySelector('meta[name=\'current-user\']');
  if (!meta) { return null; }

  return meta.getAttribute('data-id');
}

export function setSocketTokenResolver(resolver) {
  socketTokenResolver = resolver;
}

async function getToken() {
  if (socketTokenResolver) {
    try {
      const resolvedToken = await socketTokenResolver();
      if (resolvedToken) return resolvedToken;
    } catch (error) {
      logEvent('error', 'SocketError: Failed to resolve socket token', error);
    }
  }
  return getMetaToken();
}

// Number of seconds after disconnection for which we can assume that
// connection has totally failed
const CONNECTION_TIMEOUT = 10; // In sec
const ACK_TIMEOUT = 3; // In sec

const RESERVED_DATA_KEYS = ['_ack', '_id', '_type'];
const DEFAULT_RECEIVE_EVENT = 'received';

export const AsyncSendErrors = {
  TIMEOUT: 'timeout',
  DISCONNECTED: 'not_connected',
};

class Socket extends EventEmitter {
  static consumer = null;

  static uid = generateUUID();

  _queue = [];

  _timeout = null;

  status = 'waiting';

  constructor(channel, data) {
    super();
    this._channel = channel;
    this._data = data || {};
    this.subscribe();
  }

  destroy() {
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
        this._subscription = null;
      } catch {
        // Ignore error
      }
    }
  }

  subscribe() {
    this.destroy();

    this.emit('connecting');

    this._createConsumer()
      .then(() => {
        this._subscription = this._consumer.subscriptions.create({
          channel: this.channel,
          ...this.data,
        }, {
          connected: this._handleConnected,
          disconnected: this._handleDisconnected,
          rejected: this._handleRejected,
          received: this._handleReceived,
        });
      })
      .catch((error) => {
        this.emit('error');
        this.status = 'closed';
        logEvent('error', 'SocketError: Failed to create ActionCable consumer', error);
      });
  }

  /**
   * By default do not retry if send fails. If using `retries` option make
   * sure that backend has ack support for that event.
   */
  send(event, data, retries = 0) {
    // If connection is active then send data else queue the event and send it
    // back when connection is restored
    if (this.isActive()) {
      this._send(event, data, retries);
    } else {
      this._queue.push({
        event,
        data,
        retries,
      });
    }
  }

  /**
   * Backend ack support is needed for this method to work correctly.
   */
  async sendAsync(event, data) {
    const payload = this._createPayload(event, data, true);
    await this._sendAsync(payload);
  }

  isActive() {
    return this.status === 'open';
  }

  get channel() {
    return this._channel;
  }

  get data() {
    return this._data;
  }

  get consumer() {
    return this._consumer;
  }

  get subscription() {
    return this._subscription;
  }

  /* Event handlers */

  _handleConnected = () => {
    this.emit('connected');
    clearTimeout(this._timeout);
    this._timeout = null;
    this.status = 'open';
    this._sendFromQueue();
  };

  _handleDisconnected = () => {
    this.emit('disconnected');
    this._checkReconnection();
    this.status = 'closed';
  };

  _handleError = () => {
    this.emit('error');
    this.status = 'closed';
  };

  _handleReceived = (data) => {
    const { _type: type = DEFAULT_RECEIVE_EVENT, ...rest } = data;
    // No need to emit ack events we handle them internally
    if (type.startsWith('ack:')) {
      const ackEvent = `${type}:${rest._id}`;
      this.emit(ackEvent);
    } else if (type === 'ping') {
      this._handlePing();
    } else {
      this.emit(type, { socketEventName: type, ...rest });
    }
  };

  _handleRejected = () => {
    this.emit('rejected');
    this.status = 'closed';
  };

  _handlePing = () => {
    this._send('pong', {}, 3);
  };

  /* Private */

  async _createConsumer() {
    if (Socket.consumer) {
      return;
    }

    const token = await getToken();
    const paramString = token ? `?token=${token}` : '';
    Socket.consumer = createConsumer(`/cable${paramString}`);

    this._consumer.connection.events.error = this._handleError;
  }

  _createPayload(event, data, isAck = false) {
    this._throwErrorIfHasReservedKeys(data);

    const id = `${event}_${Socket.uid}_${Date.now()}`;
    return {
      ...data,
      _ack: isAck,
      _id: id,
      _type: event,
    };
  }

  _checkReconnection() {
    if (this._timeout) {
      return;
    }

    this._timeout = setTimeout(() => {
      this._timeout = null;
      // Mark as error if reconnection does not happen in the given time
      if (this.status === 'closed') {
        this.emit('error');
      }
    }, CONNECTION_TIMEOUT * 1000);
  }

  _send(event, data, retries) {
    const shouldRetry = retries > 0;
    const payload = this._createPayload(event, data, shouldRetry);
    if (shouldRetry) {
      this._sendWithRetry(payload, retries);
    } else {
      this._sendToServer(payload);
    }
  }

  _sendAsync(payload) {
    return new Promise((resolve, reject) => {
      let timer;

      const handleAcknowledgement = () => {
        clearTimeout(timer);
        resolve();
      };

      const ackEvent = `ack:${payload._type}:${payload._id}`;

      // Reject after a specific timeout
      timer = setTimeout(() => {
        this.off(ackEvent, handleAcknowledgement);
        const error = new SocketError(AsyncSendErrors.TIMEOUT, this);
        reject(error.toJson());
      }, ACK_TIMEOUT * 1000);

      // Resolve on ack
      this.once(ackEvent, handleAcknowledgement);

      // Send data and reject if connection is not active
      if (!this._sendToServer(payload)) {
        clearTimeout(timer);
        this.off(ackEvent, handleAcknowledgement);
        const error = new SocketError(AsyncSendErrors.DISCONNECTED, this);
        reject(error.toJson());
      }
    });
  }

  _sendFromQueue() {
    this._queue.forEach(({ event, data, retries }) => {
      this._send(event, data, retries);
    });

    this._queue = [];
  }

  async _sendWithRetry(payload, retries = 0) {
    let attempts = 0;
    const attemptsAllowed = retries + 1;

    while (true) {
      attempts += 1;
      try {
        // eslint-disable-next-line no-await-in-loop
        await this._sendAsync({ ...payload });
        break;
      } catch (error) {
        if (attempts >= attemptsAllowed) {
          logEvent(
            'error',
            'SocketError: Failed to send data',
            { error, payload },
          );
          throw error;
        }
      }
    }
  }

  /**
   * Returns `false` if send did not trigger at all
   */
  _sendToServer(payload) {
    return this.subscription.send(payload);
  }

  // eslint-disable-next-line
  _throwErrorIfHasReservedKeys(data) {
    if (!isObject(data)) {
      return;
    }

    const conflicts = intersection(RESERVED_DATA_KEYS, Object.keys(data));
    if (conflicts.length > 0) {
      throw new Error(`${conflicts.join(', ')} is/are reserved keys in data`);
    }
  }

  // eslint-disable-next-line
  get _consumer() {
    return Socket.consumer;
  }
}

export default Socket;
