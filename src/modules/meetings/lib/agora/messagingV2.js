import forOwn from 'lodash/forOwn';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';

import { isDevelopment } from '@common/utils/debug';
import { isNullOrUndefined } from '@common/utils/type';
import { lazyModule } from '@common/utils/lazy';
import MessagingInterface from '~meetings/lib/messaging.interface';
import { MessagingConnectionStates } from '~meetings/utils/messagingConnection';
import { randomWait, wait } from '@common/utils/async';
import MESSAGING_EVENTS from '~meetings/lib/messaging.events';

const QUERY_ONLINE_USERS_TIME_LIMIT = 1000; // In ms

const QUERY_USER_LIMIT = 30;
const QUERY_USER_TIME_LIMIT = 6000; // In ms

function fetchRTMSdk() {
  return lazyModule(() => import('agora-rtm-sdk'));
}

class MessagingV2 extends MessagingInterface {
  _apiCalls = {
    getUser: 0,
  };

  // eslint-disable-next-line
  async isDeviceSupported() {
    return true;
  }

  async initialise({ isNetworkRestricted = false }) {
    if (this.isLoggedIn) return;

    const AgoraRTM = await fetchRTMSdk();
    const { RTM } = AgoraRTM;
    const loginUid = this._generateAgoraUid(this.userId);
    const tokenPrefix = (this.token || '').slice(0, 8);
    const tokenLength = (this.token || '').length;

    this._client = new RTM(
      this._appId,
      loginUid,
      {
        cloudProxy: isNetworkRestricted || this._shouldUseProxy,
        logUpload: !isDevelopment(),
        logLevel: 'debug', // update it to 'none' once the version is stable
      },
    );

    try {
      await this.client.login({ token: this.token });
    } catch (error) {
      // Debug-only signal for token/account mismatch checks. Token is redacted.
      // eslint-disable-next-line no-console
      console.error('[Agora::MessagingV2] RTM login failed', {
        appId: this._appId,
        channelName: this.channelName,
        userId: this.userId,
        loginUid,
        tokenPrefix,
        tokenLength,
        errorMessage: error?.message,
        errorCode: error?.code,
      });
      throw error;
    }

    this._addEventListeners();
    this.isLoggedIn = true;
  }

  async join() {
    if (this.isJoined) return;

    await this.client.subscribe(this.channelName, {
      withMessage: true,
      withPresence: true,
    });

    // Manually trigger for current user
    this.emit(MESSAGING_EVENTS.userOnline, { userId: this.userId });
    this.isJoined = true;
  }

  async destroy() {
    if (this.isJoined) {
      await this.client.unsubscribe(this.channelName);
      this.isJoined = false;
    }

    if (this.isLoggedIn) {
      this._removeEventListeners();
      await this.client.logout();
      this.isLoggedIn = false;
    }
  }

  async sendMessage(body, author, userId = null, currentTime = Date.now()) {
    const data = { author, body, currentTime };
    if (!isNullOrUndefined(userId)) {
      data.toId = userId;
    }
    const payload = this._createMessagePayload(data, 'text-message');
    const agoraUid = this._generateAgoraUid(userId);

    if (isNullOrUndefined(userId) || userId === '-1') {
      // Send to channel
      await this.client.publish(this.channelName, payload, {
        channelType: 'MESSAGE',
      });
    } else {
      // Send to specific user (P2P)
      await this.client.publish(agoraUid, payload, {
        channelType: 'USER',
      });
    }
  }

  async sendEvent(eventType, eventData, emit = false) {
    const payload = this._createMessagePayload(eventData, eventType);
    await this.client.publish(this.channelName, payload, {
      channelType: 'MESSAGE',
    });

    if (emit) {
      const { type, data: baseData } = JSON.parse(payload);
      const data = {
        ...baseData,
        timestamp: Date.now(),
        fromId: this.userId,
      };
      this.emit(type, data);
    }
  }

  async getMembersStatus() {
    const { occupants, nextPage } = await this.client.presence.getOnlineUsers(
      this.channelName,
      'MESSAGE',
    );

    const allOccupants = [...(occupants || [])];
    let currentPage = nextPage;

    /* eslint-disable no-await-in-loop -- sequential pagination */
    while (currentPage) {
      await wait(QUERY_ONLINE_USERS_TIME_LIMIT);

      const {
        occupants: nextOccupants, nextPage: nextNextPage,
      } = await this.client.presence.getOnlineUsers(
        this.channelName,
        'MESSAGE',
        { page: currentPage },
      );
      allOccupants.push(...(nextOccupants || []));
      currentPage = nextNextPage;
    }
    /* eslint-enable no-await-in-loop */

    const memberStatuses = {};
    allOccupants.forEach((item) => {
      const uid = item?.userId;
      if (!uid) return;
      const parsedUserId = this._parseUserId(uid);
      memberStatuses[parsedUserId] = true;
    });

    return memberStatuses;
  }

  async setUser(user) {
    const cleanedUser = mapValues(
      pickBy(user, o => !isNullOrUndefined(o)),
      o => o.toString(),
    );
    const data = Object.entries(cleanedUser).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    const options = {
      userId: this._generateAgoraUid(this.userId),
      addTimestamp: true,
      addUserId: true,
    };
    return this.client.storage.setUserMetadata(data, options);
  }

  async getUser(userId) {
    await this._throttleGetUser();
    const agoraUid = this._generateAgoraUid(userId);

    const { metadata } = await this.client.storage.getUserMetadata({
      userId: agoraUid,
    });

    const attributes = {};
    if (metadata) {
      forOwn(metadata, ({ value }, key) => {
        attributes[key] = ['true', 'false'].includes(value)
          ? value === 'true'
          : value;
      });
    }
    return attributes;
  }

  async _throttleGetUser() {
    this._apiCalls.getUser += 1;
    const exceedCount = this._apiCalls.getUser - QUERY_USER_LIMIT;
    if (exceedCount >= 0) {
      const timeout = QUERY_USER_TIME_LIMIT
        + ((QUERY_USER_TIME_LIMIT / QUERY_USER_LIMIT) * exceedCount);
      await wait(timeout);
      this._apiCalls.getUser = 0;
    } else {
      await randomWait(1000, 3000);
    }
  }

  /* Event Handlers */

  _handleStatus = (event) => {
    const { state, reason } = event;
    let connectionState;

    switch (state) {
      case 'CONNECTED':
        connectionState = MessagingConnectionStates.connected;
        break;
      case 'RECONNECTING':
      case 'INTERRUPTED':
        connectionState = MessagingConnectionStates.reconnecting;
        break;
      case 'FAILED': {
        const rejectedReasons = [
          'REJECTED_BY_SERVER',
          'KICKED_OUT_BY_SERVER',
          'SAME_UID_LOGIN',
        ];
        connectionState = reason && rejectedReasons.includes(reason)
          ? MessagingConnectionStates.rejected
          : MessagingConnectionStates.failed;
        break;
      }
      case 'DISCONNECTED':
        connectionState = reason === 'TOKEN_EXPIRED'
          ? MessagingConnectionStates.unauthorised
          : MessagingConnectionStates.disconnected;
        break;
      case 'CONNECTING':
      default:
        connectionState = MessagingConnectionStates.connecting;
    }

    this.emit(MESSAGING_EVENTS.connectionStateChange, {
      state: connectionState,
      reason: reason || null,
      rawState: state || null,
    });
  };

  _handleMessage = (event) => {
    const { message, publisher, timestamp } = event;
    const fromId = this._parseUserId(publisher);

    // Skip emitting our own messages - parent already added them optimistically
    // when we sent, so we avoid duplicate display for the sender
    if (fromId === this.userId) return;

    const messageText = typeof message === 'string'
      ? message
      : new TextDecoder().decode(message);
    const { type, data: baseData } = JSON.parse(messageText);
    const data = {
      ...baseData,
      timestamp: timestamp || Date.now(),
      fromId,
    };
    this.emit(type, data);
  };

  _handlePresence = (event) => {
    const {
      eventType, publisher, snapshot, interval,
    } = event;

    if (eventType === 'REMOTE_JOIN') {
      this._emitEvent(MESSAGING_EVENTS.userOnline, publisher);
    } else if (eventType === 'REMOTE_LEAVE' || eventType === 'REMOTE_TIMEOUT') {
      this._emitEvent(MESSAGING_EVENTS.userOffline, publisher);
    } else if (eventType === 'SNAPSHOT' && snapshot) {
      snapshot.forEach(({ userId: snapUserId }) => {
        this._emitEvent(MESSAGING_EVENTS.userOnline, snapUserId);
      });
    } else if (eventType === 'INTERVAL' && interval) {
      const {
        join, leave, timeout, userStateList,
      } = interval;
      join?.users?.forEach((uid) => {
        this._emitEvent(MESSAGING_EVENTS.userOnline, uid);
      });
      leave?.users?.forEach((uid) => {
        this._emitEvent(MESSAGING_EVENTS.userOffline, uid);
      });
      timeout?.users?.forEach((uid) => {
        this._emitEvent(MESSAGING_EVENTS.userOffline, uid);
      });
      userStateList?.forEach((item) => {
        const { userId } = item;
        this._emitEvent(MESSAGING_EVENTS.userOnline, userId);
      });
    }
  };

  /* Private */

  _addEventListeners() {
    this.client.addEventListener('status', this._handleStatus);
    this.client.addEventListener('message', this._handleMessage);
    this.client.addEventListener('presence', this._handlePresence);
  }

  _removeEventListeners() {
    if (!this.client) return;
    this.client.removeEventListener('status', this._handleStatus);
    this.client.removeEventListener('message', this._handleMessage);
    this.client.removeEventListener('presence', this._handlePresence);
  }

  // eslint-disable-next-line class-methods-use-this
  _parseUserId(agoraUid) {
    const [, userId] = agoraUid.split('_');
    return userId;
  }

  _createMessagePayload(data, type) {
    const uid = `${this.userId}_${this.channelName}_${Date.now()}`;
    return JSON.stringify({
      data: { ...data, uid },
      type,
    });
  }

  _generateAgoraUid(userId) {
    return `${this.channelName}_${userId}`;
  }

  _emitEvent(eventType, userId) {
    this.emit(eventType, { userId: this._parseUserId(userId) });
  }

  get _appId() {
    return this.config.appId;
  }

  get _shouldUseProxy() {
    return this.options.useProxy;
  }
}

export default MessagingV2;
