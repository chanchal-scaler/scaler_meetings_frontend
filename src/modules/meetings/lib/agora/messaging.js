import chunk from 'lodash/chunk';
import forOwn from 'lodash/forOwn';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';

import { isDevelopment } from '@common/utils/debug';
import { isNullOrUndefined } from '@common/utils/type';
import { lazyModule } from '@common/utils/lazy';
import { MessagingConnectionStates } from '~meetings/utils/messagingConnection';
import { randomWait, wait } from '@common/utils/async';
import MessagingInterface from '~meetings/lib/messaging.interface';
import MESSAGING_EVENTS from '~meetings/lib/messaging.events';

const clientEvents = ['ConnectionStateChanged', 'MessageFromPeer'];
const channelEvents = ['ChannelMessage', 'MemberJoined', 'MemberLeft'];

const QUERY_PEERS_COUNT_LIMIT = 250;
const QUERY_PEERS_TIME_LIMIT = 1000; // In ms

const QUERY_USER_LIMIT = 30;
const QUERY_USER_TIME_LIMIT = 6000; // In ms

function fetchRTMSdk() {
  return lazyModule(() => import('agora-rtm-sdk'));
}

class Messaging extends MessagingInterface {
  _apiCalls = {
    getUser: 0,
  }

  /* Public  */

  async destroy() {
    if (this.isJoined) {
      await this._chatChannel.leave();
      this.isJoined = false;
    }

    if (this.isLoggedIn) {
      await this.client.logout();
      this.isLoggedIn = false;
    }
  }

  // eslint-disable-next-line
  async isDeviceSupported() {
    return true;
  }

  async initialise({ isNetworkRestricted = false }) {
    if (this.isLoggedIn) return;

    const AgoraRTM = await fetchRTMSdk();
    this._client = AgoraRTM.createInstance(this._appId, {
      enableCloudProxy: isNetworkRestricted || this._shouldUseProxy,
      enableLogUpload: !isDevelopment(),
      logFilter: AgoraRTM.LOG_FILTER_OFF,
    });

    // Login into RTM Service(chat)
    await this.client.login({
      token: this.token,
      uid: this._generateAgoraUid(this.userId),
    });
    this.isLoggedIn = true;
  }

  async join() {
    if (this.isJoined) return;
    this._chatChannel = this._createChannel(this.channelName);
    this._addEventListeners();

    await this._chatChannel.join();

    // Manually triggering this event for current user as server does not
    // trigger. This event is used to render `Joined message`
    this.emit(MESSAGING_EVENTS.userOnline, { userId: this.userId });
    this.isJoined = true;
  }

  /**
   * Can be called only after `join` method is called
   */
  async getMembersStatus() {
    const allMembers = await this._chatChannel.getMembers();

    // Logic that makes sure that we respect the limitations set by agora
    const memberChunks = chunk(allMembers, QUERY_PEERS_COUNT_LIMIT);
    let memberStatuses = {};
    for (let i = 0; i < memberChunks.length; i += 1) {
      const members = memberChunks[i];
      if (i !== 0) {
        // eslint-disable-next-line no-await-in-loop
        await wait(QUERY_PEERS_TIME_LIMIT);
      }
      // eslint-disable-next-line no-await-in-loop
      const statuses = await this.client.queryPeersOnlineStatus(members);

      // convert agoraUids back to userIds
      const _statuses = this._replaceAgoraUidInStatuses(statuses);

      memberStatuses = {
        ...memberStatuses,
        ..._statuses,
      };
    }
    return memberStatuses;
  }

  /**
   * Can be called only after `join` method is called
   */
  async sendMessage(body, author, userId = null, currentTime = Date.now()) {
    const data = { author, body, currentTime };
    if (!isNullOrUndefined(userId)) {
      data.toId = userId;
    }
    const payload = this._createMessagePayload(data, 'text-message');

    const agoraUid = this._generateAgoraUid(userId);

    if (isNullOrUndefined(userId) || userId === '-1') {
      await this._chatChannel.sendMessage({ text: payload });
    } else {
      await this.client.sendMessageToPeer(
        { text: payload },
        agoraUid,
      );
    }
  }

  async sendEvent(eventType, eventData, emit = false) {
    const payload = this._createMessagePayload(eventData, eventType);
    await this._chatChannel.sendMessage({ text: payload });

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

  setUser(user) {
    // Agora only allows string values
    const cleanedUser = mapValues(
      // Remove null and undefined values
      pickBy(user, o => !isNullOrUndefined(o)),
      o => o.toString(),
    );
    return this.client.setLocalUserAttributes(cleanedUser);
  }

  async getUser(userId) {
    await this._throttleGetUser();
    const agoraUid = this._generateAgoraUid(userId);

    const attributes = await this.client.getUserAttributes(agoraUid);
    // Because agora only allows to store string values in attributes, we store
    // booleans as strings. Below logic just transforms strin booleans to
    // boolean data types.
    return mapValues(attributes, o => {
      if (['true', 'false'].includes(o)) {
        return o === 'true';
      } else {
        return o;
      }
    });
  }

  /* Event handlers */

  _handleConnectionStateChanged = (rawState, reason) => {
    let state;
    switch (reason) {
      case 'REMOTE_LOGIN':
      case 'BANNED_BY_SERVER':
        state = MessagingConnectionStates.rejected;
        break;
      case 'INTERRUPTED':
        state = MessagingConnectionStates.reconnecting;
        break;
      case 'LOGIN_FAILURE':
        state = MessagingConnectionStates.unauthorised;
        break;
      case 'LOGIN_SUCCESS':
        state = MessagingConnectionStates.connected;
        break;
      case 'LOGIN_TIMEOUT':
        state = MessagingConnectionStates.failed;
        break;
      case 'LOGOUT':
        state = MessagingConnectionStates.disconnected;
        break;
      default:
        state = MessagingConnectionStates.connecting;
    }

    this.emit(MESSAGING_EVENTS.connectionStateChange, {
      state,
      reason: reason || null,
      rawState: rawState || null,
    });
  }

  _handleMessageFromPeer = (...args) => this._handleTextMessage(...args);

  _handleChannelMessage = (...args) => this._handleTextMessage(...args);

  _handleTextMessage = (message, agoraUid, properties) => {
    const { type, data: baseData } = JSON.parse(message.text);
    const data = {
      ...baseData,
      timestamp: properties.serverReceivedTs,
      fromId: this._parseUserId(agoraUid),
    };
    this.emit(type, data);
  }

  _handleMemberJoined = (agoraUid) => {
    this.emit(
      MESSAGING_EVENTS.userOnline,
      { userId: this._parseUserId(agoraUid) },
    );
  }

  _handleMemberLeft = (agoraUid) => {
    this.emit(MESSAGING_EVENTS.userOffline, {
      userId: this._parseUserId(agoraUid),
    });
  }

  /* Private */

  _addEventListeners() {
    clientEvents.forEach(
      eventName => this.client.on(eventName, this[`_handle${eventName}`]),
    );

    channelEvents.forEach(
      eventName => this._chatChannel.on(eventName, this[`_handle${eventName}`]),
    );
  }

  _replaceAgoraUidInStatuses(statuses) {
    const _statuses = {};
    forOwn(statuses, (status, agoraUid) => {
      const userId = this._parseUserId(agoraUid);
      _statuses[userId] = status;
    });
    return _statuses;
  }

  _createChannel(name) {
    return this.client.createChannel(name);
  }

  _createMessagePayload(data, type) {
    // Creating a unique id for every message. Not used right now but making
    // sure it exists if we ever need to identify a message uniquely
    const uid = `${this.userId}_${this.channelName}_${Date.now()}`;
    return JSON.stringify({
      data: { ...data, uid },
      type,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  _parseUserId(agoraUid) {
    const [, userId] = agoraUid.split('_');
    return userId;
  }

  _generateAgoraUid(userId) {
    return `${this.channelName}_${userId}`;
  }

  // Logic that makes sure that we respect the api limitations set by agora
  async _throttleGetUser() {
    this._apiCalls.getUser += 1;
    const exceedCount = this._apiCalls.getUser - QUERY_USER_LIMIT;
    if (exceedCount >= 0) {
      const timeout = QUERY_USER_TIME_LIMIT
        + ((QUERY_USER_TIME_LIMIT / QUERY_USER_LIMIT) * exceedCount);
      await wait(timeout);
      this._apiCalls.getUser = 0;
    } else {
      // Few times there is delay for the user attributes to be updated. So we
      // wait for some time before fetching.
      await randomWait(1000, 3000);
    }
  }

  get _appId() {
    return this.config.appId;
  }

  get _shouldUseProxy() {
    return this.options.useProxy;
  }
}

export default Messaging;
