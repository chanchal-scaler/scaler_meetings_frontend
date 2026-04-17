import {
  action, computed, flow, makeObservable, observable, reaction, runInAction,
} from 'mobx';
import camelCase from 'lodash/camelCase';
import findLastIndex from 'lodash/findLastIndex';
import containsHtml from '@common/utils/htmlPattern';
import containsLink from '@common/utils/urlPattern';

import {
  ACTIVE_PARTICIPANT_LIMIT,
  CHAT_RATE_LIMIT_TIMEOUT,
  ChatNotificationLevel,
  ChatPermissionLevel,
  MAX_MESSAGE_LENGTH,
  publicMessagesAllowed,
  STATUS_REFRESH_ENABLED,
} from '~meetings/utils/messaging';
import { isNegativeContent } from '~meetings/utils/meeting';
import { isNullOrUndefined } from '@common/utils/type';
import { isWindowHidden } from '@common/utils/browser';
import { logEvent } from '@common/utils/logger';
import {
  MessagingConnectionStates,
  MessagingErrorStates,
} from '~meetings/utils/messagingConnection';
import { JOIN_MODES, MEETING_ACTION_TRACKING } from '~meetings/utils/constants';
import { toast } from '@common/ui/general/Toast';
import _Communication from './_communication';
import meetingsApi from '~meetings/api/meetings';
import Agora from '~meetings/lib/agora';
import AudioNotification from '@common/lib/audioNotification';
import EventMessage, { EventTypes } from './eventMessage';
import LiveReactions from './liveReactions';
import MESSAGING_EVENTS from '~meetings/lib/messaging.events';
import PollMessage from './pollMessage';
import QuestionMessage from './questionMessage';
import ReactionsMessage from './reactionsMessage';
import settingsStore from '~meetings/stores/settingsStore';
import TextMessage from './textMessage';

const notification = new AudioNotification('info');

const clientEvents = [
  MESSAGING_EVENTS.connectionStateChange, MESSAGING_EVENTS.userOnline,
  MESSAGING_EVENTS.userOffline, 'poll-result', 'text-message',
  'new-participant', 'new-question', 'question-status-change',
  'question-vote', 'reaction', 'playback-update', 'new-pinned-message',
  'delete-pinned-message', 'playlist-content-session-updated',
  'delete-text-message',
];

const alertNotification = new AudioNotification('alert');

const JOIN_MESSAGES_ENABLED = false;

const PARTICIPANT_STATUS_POLL_INTERVAL = 30; // In sec

const RECONNECTION_TIMEOUT = 15; // In secs

// Minimun gap between message renders
const MESSAGE_RENDER_INTERVAL = 100; // In ms

class Messaging extends _Communication {
  _firstUnreadMessage = null;

  _messageQueue = [];

  _messageLoopEnqueued = false;

  _chatCooldownInterval = null;

  isInitialised = false;

  isLoadingMessages = false;

  isLoadingStatuses = false;

  isTyping = false;

  connectionState = MessagingConnectionStates.disconnected;

  lastConnectionReason = null;

  lastConnectionRawState = null;

  /**
   * Stores cursor position of chat input before input it blurred
   */
  cursorPosition = 0;

  /**
   * Stores list of messages that will be rendered in the chat window.
   * Apart from messages loaded from history all other messages which need to
   * be added to this list should use `addMessageToQueue` method
   */
  messages = observable.array([], { deep: false });

  messageToId = '-1';

  messageInput = '';

  isPickingEmoji = false;

  lastReadMessageIndex = -1;

  areAllMessagesLoaded = false;

  reactions = null;

  chatRateLimitCountDown = null;

  constructor(...args) {
    super(...args);
    makeObservable(this, {
      _handleTextMessage: action.bound,
      chatRateLimitCountDown: observable,
      connectionState: observable,
      lastConnectionRawState: observable.ref,
      lastConnectionReason: observable.ref,
      isEnabled: computed,
      isLoadingMessages: observable,
      isLoadingStatuses: observable,
      isPickingEmoji: observable,
      isPrivateEnabled: computed,
      isTyping: observable,
      lastReadMessageIndex: observable,
      messageInput: observable,
      messageToId: observable,
      reactions: observable.ref,
      setLastReadMessageIndex: action.bound,
      sendMessage: action.bound,
      sendToList: computed,
      sendToUserIds: computed,
      setConnectionState: action.bound,
      setChatRateLimit: action.bound,
      setCursorPositon: action.bound,
      setMessageInput: action.bound,
      setMessageToId: action.bound,
      setPickingEmoji: action.bound,
      setTyping: action.bound,
      canSendMessageDuringCooldown: computed,
      unreadMessageCount: computed,
    });
  }

  async initialise(joinMode = 'normal') {
    // if joinMode is not in JOIN_MODES, return
    if (!JOIN_MODES[joinMode]) return;

    if (
      !super.initialise()
      || this.isLoadingMessages
    ) return;

    await this.loadMessages();
    await this.join();
  }

  /**
   * Any new message that needs to be rendered on UI should be passed to this
   * method.
   * Do not directly add them to `this.messages`.
   */
  addMessageToQueue(message) {
    if (this._shouldIgnoreMessage(message)) return;

    this._messageQueue.push(message);
    if (!this._messageLoopEnqueued) {
      this._messageLoopId = setTimeout(() => {
        runInAction(() => {
          this.messages.push(...this._messageQueue);
          this._messageQueue = [];
          this._messageLoopEnqueued = false;
        });
      }, MESSAGE_RENDER_INTERVAL);
      this._messageLoopEnqueued = true;
    }
  }

  canSendMessageTo(userId) {
    const participant = this.meeting.findOrCreateParticipant(userId);
    if (participant.isGhost) return false;

    const canSend = this.sendToList.find(o => o.value === userId);
    return !!canSend;
  }

  destroy = flow(function* () {
    if (this._firstUnreadReaction) {
      this._firstUnreadReaction();
    }
    clearTimeout(this._connectionStateTimeout);
    clearInterval(this._statusesPollInterval);
    clearTimeout(this._messageLoopId);
    clearInterval(this._chatCooldownInterval);
    this._removeEventListeners();
    yield this.client.destroy();
    this.isInitialised = false;
    this.isLoaded = false;
  });

  handleSettingChange(settingName, value) {
    switch (settingName) {
      case 'chat_cooldown_enabled':
        if (!value) {
          clearInterval(this._chatCooldownInterval);
          this.chatRateLimitCountDown = null;
        }
        break;
      default:
        break;
    }
  }

  join = flow(function* () {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    this.loadError = null;
    this._trackJoinInitiated();

    this._addEventListeners();
    // client will try to join using proxy if network is restricted
    const joiningWithProxy = this.meeting.isNetworkRestricted;
    try {
      // Any initialisation that need to be done before joining channel for the
      // provider will happen in the below method call
      // Initialisation should happen only once
      if (!this.isInitialised) {
        yield this.client.initialise({
          isNetworkRestricted: joiningWithProxy,
        });

        const {
          avatar,
          name,
          is_unmuted: isUnmuted,
          is_bot: isBot,
          role,
        } = this.meeting.user;
        yield this.client.setUser({
          avatar,
          name: name || 'User',
          is_unmuted: isUnmuted,
          is_bot: isBot,
          role,
        });
        this.isInitialised = true;
      }
      yield this.client.join();
      this.reactions = new LiveReactions(this);
      this.isLoaded = true;
      this._trackJoinVisible();
      this.setParticipantsStatus();
      this.sendMyData();
      this._addParticipantsStatusPoll();
      if (joiningWithProxy) {
        this.meeting.trackEvent(
          MEETING_ACTION_TRACKING.meetingMessagingJoined,
          { isNetworkRestricted: joiningWithProxy },
        );
      }
    } catch (error) {
      // retry join event only if the request failed
      // without using proxy. retry not needed if the request
      // failed even after using proxy
      if (!joiningWithProxy && this.meeting.isNetworkRestricted) {
        this.isLoading = false;
        this.join();
        return;
      }
      this.loadError = error;
      this._trackJoinFailed(error);
      logEvent('error', 'MessagingError: Failed to join chat', error);
    }

    this.isLoading = false;
  });

  loadMessages = flow(function* () {
    if (this.areAllMessagesLoaded || this.isLoadingMessages) return;

    this.isLoadingMessages = true;
    try {
      const oldestMessage = this.messages.length > 0 && this.messages[0];
      const json = yield meetingsApi.getMessages(
        this.slug,
        oldestMessage ? oldestMessage.timestamp : Date.now(),
      );
      // Do this only when loading first set of messages
      if (this.messages.length === 0) {
        this._addFirstUnreadReaction();
      }

      this.meeting.updateParticipants(json.participants);
      this._createMessages(json.messages);
      this.areAllMessagesLoaded = json.messages.length === 0;
    } catch (error) {
      logEvent('error', 'LoginError: Failed to load messages', error);
    }
    this.isLoadingMessages = false;
  }).bind(this);

  markFirstUnreadMessage() {
    const { lastReadMessageIndex } = this;
    const messages = this.messages.slice();
    let unreadMessageIndex = null;

    // We don't consider local messages when calculating unread messages.
    let currentIndex = findLastIndex(messages, o => !(o.isLocal || o.isMine));
    while (currentIndex > 0) {
      const previousMessageIndex = findLastIndex(
        messages,
        o => !(o.isLocal || o.isMine),
        currentIndex - 1,
      );

      if (
        currentIndex > lastReadMessageIndex
        && previousMessageIndex <= lastReadMessageIndex
      ) {
        unreadMessageIndex = currentIndex;
        break;
      } else if (currentIndex <= lastReadMessageIndex) {
        break;
      }

      currentIndex = previousMessageIndex;
    }

    if (this._firstUnreadMessage) {
      this._firstUnreadMessage.setFirstUnread(false);
    }

    if (unreadMessageIndex && unreadMessageIndex > -1) {
      const unreadMessage = this.messages[unreadMessageIndex];
      unreadMessage.setFirstUnread(true);
      this._firstUnreadMessage = unreadMessage;
    }
  }

  // For large meetings no need to refresh as we anyway do not show
  // participant list to audience. For hosts about 50 participants is loaded
  // from server and other can be fetched by searching
  async refreshParticipant(participant) {
    if (this.meeting.isLarge || participant.isLoaded) {
      return;
    }

    try {
      const data = await this.client.getUser(participant.userId);
      participant.setData(data);
      participant.setLoaded(true);
    } catch (error) {
      // Not a fatal error
    }
  }

  sendEvent(...args) {
    this.client.sendEvent(...args);
  }

  sendMessage() {
    const currentTime = Date.now();
    if (!this.canSendMessage) {
      if (this.isMessageLarge) {
        toast.show({
          message: 'Messages cannot be more than 1000 characters long!',
        });
      }

      return;
    }

    if (!this.canSendMessageDuringCooldown) {
      toast.show({
        message: `Please wait ${Math.ceil(this.chatRateLimitCountDown)} `
          + 'seconds before sending another message.',
        type: 'warning',
      });
      return;
    }

    let toId = this.messageToId;

    if (!this.canSendMessageTo(this.messageToId)) {
      if (this.sendToList.length === 0) {
        toast.show({ message: 'Chat has been disabled by the host!' });
        return;
      } else {
        // Incase a message is sent to ghost participant
        // and the ghost is dropped then the message sent
        // will be sent to the super_host or the host

        const participant = this.meeting.findOrCreateParticipant(
          this.messageToId,
        );
        if (participant.isGhost) {
          toast.show({
            message: `The instructor is not accepting messages 
              at the moment. Please send to host instead!`,
            type: 'error',
          });
          return;
        }

        toId = this.sendToList[0].value;
        this.setMessageToId(toId);
      }
    }

    const localMessage = new TextMessage(
      this,
      this.userId,
      currentTime,
      { body: this.messageInput, toId, currentTime },
      true,
    );

    if (this.isCooldownEnabled) {
      this.setChatRateLimit();
    }
    settingsStore.setRTooltipStatus(this.messageInput);
    this.addMessageToQueue(localMessage);
    this.messageInput = '';
  }

  sendMyData() {
    const participant = this.meeting.currentParticipant;
    this.sendEvent('new-participant', participant.data);
  }

  sendReaction(reactionType) {
    if (!this.reactions.canReact) {
      return;
    }

    this.manager.saveReaction(reactionType);
    this.client.sendEvent('reaction', { type: reactionType });
    this.reactions.addResponse(reactionType, this.userId);
  }

  setConnectionState(state) {
    this.connectionState = state;
    if (MessagingErrorStates.includes(state)) {
      this.meeting.setActiveTab('chat');
      alertNotification.play();
    }
    this.meeting.track(`chat-${state}`);
  }

  _trackJoinInitiated() {
    this.meeting.trackEvent(
      MEETING_ACTION_TRACKING.meetingMessagingJoinInitiated,
      this._getTrackingAttributes(),
    );
  }

  _trackJoinVisible() {
    this.meeting.trackEvent(
      MEETING_ACTION_TRACKING.meetingMessagingVisible,
      this._getTrackingAttributes({
        isVisible: true,
      }),
    );
  }

  _trackJoinFailed(error) {
    this.meeting.trackEvent(
      MEETING_ACTION_TRACKING.meetingMessagingJoinFailed,
      this._getTrackingAttributes({
        hasError: true,
        error: error?.message || String(error),
        errorMessage: error?.message || 'MessagingError: Failed to join chat',
        errorName: error?.name,
        errorCode: error?.code ?? error?.response?.status,
      }),
    );
  }

  _getTrackingAttributes(extra = {}) {
    return {
      messagingConnectionState: this.connectionState,
      messagingConnectionReason: this.lastConnectionReason,
      messagingConnectionRawState: this.lastConnectionRawState,
      ...extra,
    };
  }

  setCursorPositon(position) {
    this.cursorPosition = position;
  }

  setMessageInput(value) {
    this.messageInput = value;
  }

  setMessageToId(toId) {
    this.messageToId = toId;
  }

  setLastReadMessageIndex(messageIndex) {
    this.lastReadMessageIndex = messageIndex;
  }

  setPickingEmoji(isPicking) {
    this.isPickingEmoji = isPicking;
  }

  setTyping(isTyping) {
    this.isTyping = isTyping;
  }

  setParticipantsStatus = flow(function* () {
    // For large meetings we do not want to use this method to get online
    // status of users
    if (this.meeting.isLarge) {
      return;
    }

    this.isLoadingStatuses = true;
    this.statusesLoadError = null;

    try {
      const statuses = yield this.client.getMembersStatus();
      const onlineUserIds = Object.keys(statuses).filter(
        userId => statuses[userId],
      );
      this.meeting.updateOnlineParticipants(onlineUserIds);
    } catch (error) {
      this.statusesLoadError = error;
      logEvent('error', 'MessagingError: Failed to load online status', error);
    }

    this.isLoadingStatuses = false;
  });

  setChatRateLimit() {
    this.chatRateLimitCountDown = CHAT_RATE_LIMIT_TIMEOUT;
    clearInterval(this._chatCooldownInterval);
    this._chatCooldownInterval = setInterval(() => {
      runInAction(() => {
        this.chatRateLimitCountDown -= 1;
        if (this.chatRateLimitCountDown <= 0) {
          clearInterval(this._chatCooldownInterval);
          this.chatRateLimitCountDown = null;
        }
      });
    }, 1000);
  }

  get canSendMessage() {
    return !(this.isMessageEmpty || this.isMessageLarge)
            && this.canSendMessageDuringCooldown;
  }

  get canSendMessageDuringCooldown() {
    if (this.meeting.isHost || !this.isCooldownEnabled) {
      return true;
    }

    return !this.chatRateLimitCountDown;
  }

  get isCooldownEnabled() {
    return this.manager.settings.chat_cooldown_enabled;
  }

  get isEnabled() {
    return !this.manager.isChatDisabled && this.sendToList.length > 0;
  }

  get isMessageEmpty() {
    return !this.messageInput || this.messageInput.trim() === '';
  }

  get isMessageLarge() {
    return this.messageInput && this.messageInput.length > MAX_MESSAGE_LENGTH;
  }

  get isPrivateEnabled() {
    return (this.sendToList.length > 1 || this.sendToList[0].value !== '-1');
  }

  get sendToList() {
    const chatScope = this.manager.settings.chat_scope;
    let peers = [];
    if (this.meeting.isHost) {
      if (this.meeting.isGhost) {
        peers = this.meeting.allHosts.filter(o => !o.isCurrentUser);
      } else {
        peers = this.meeting.activePeers;
      }
    } else {
      switch (chatScope) {
        case ChatPermissionLevel.all:
          peers = this.meeting.activePeers;
          break;
        case ChatPermissionLevel.hosts:
        case ChatPermissionLevel.public_and_hosts:
          peers = this.meeting.allHosts;
          break;
        default:
          peers = [];
      }
    }

    const list = peers.map(participant => ({
      value: participant.userId,
      label: participant.name,
    }));

    // Do not allow ghost users to send public messages.
    if (
      !this.meeting.isGhost
      && (
        this.meeting.isHost
        || publicMessagesAllowed(chatScope)
      )
    ) {
      list.unshift({
        value: '-1',
        label: 'Everyone',
      });
    }

    return list;
  }

  get sendToUserIds() {
    return new Set(this.sendToList.map(o => o.value));
  }

  get unreadMessageCount() {
    const unreadMessages = this.messages
      .slice(this.lastReadMessageIndex + 1)
      .filter(o => !o.isMine);

    return unreadMessages.length;
  }

  /* Event handlers */

  _handleConnectionStateChange = ({
    state,
    reason = null,
    rawState = null,
  }) => {
    this.lastConnectionReason = reason;
    this.lastConnectionRawState = rawState;
    this.setConnectionState(state);

    // Auto change reconnecting state to failed if it does not reconnect
    // in some time
    if (
      state === MessagingConnectionStates.reconnecting
      && isNullOrUndefined(this._connectionStateTimeout)
    ) {
      this._connectionStateTimeout = setTimeout(() => {
        if (this.connectionState === MessagingConnectionStates.reconnecting) {
          this.setConnectionState(MessagingConnectionStates.failed);
        }
        this._connectionStateTimeout = null;
      }, RECONNECTION_TIMEOUT * 1000);
    }
  };

  _handleNewParticipant = (data) => {
    this.meeting.updateParticipant(data);
  };

  _handlePeerOffline = ({ userId }) => {
    const participant = this.meeting.findOrCreateParticipant(userId);
    participant.setActive(false);
    if (JOIN_MESSAGES_ENABLED) {
      const eventMessage = new EventMessage(
        this,
        userId,
        Date.now(),
        EventTypes.left,
      );
      this.addMessageToQueue(eventMessage);
    }
  };

  _handlePeerOnline = ({ userId }) => {
    const participant = this.meeting.findOrCreateParticipant(userId, true);
    participant.setActive(true);
    if (JOIN_MESSAGES_ENABLED) {
      const eventMessage = new EventMessage(
        this,
        userId,
        Date.now(),
        EventTypes.joined,
      );
      this.addMessageToQueue(eventMessage);
    }
  };

  _handlePollResult = (data) => {
    const { fromId, timestamp, ...rest } = data;
    const message = new PollMessage(this, fromId, timestamp, rest);
    this.addMessageToQueue(message);
  };

  _handleReaction = (data) => {
    this.reactions.addResponse(data.type, data.fromId);
  };

  _handleTextMessage = (data) => {
    const {
      author, fromId, currentTime, ...rest
    } = data;
    this.meeting.updateParticipant(author);
    const message = new TextMessage(this, fromId, currentTime, rest);
    this.addMessageToQueue(message);

    if (this._shouldNotify(message)) {
      notification.play(true);
    }
  };

  _handleNewPinnedMessage = (data) => {
    this.meeting.noticeBoard.addPinnedMessage(data.message);
    // ignore adding message to chat window
    // if new notice board is enabled
    if (this.meeting.config?.newNoticeBoardEnabled) {
      return;
    }
    const {
      fromId, timestamp,
    } = data;
    const { body, toId } = data.message;
    const rest = { body, toId, pinned: true };
    const message = new TextMessage(this, fromId, timestamp, rest);
    this.addMessageToQueue(message);
  };

  _handleDeletePinnedMessage = (data) => {
    this.meeting.noticeBoard.removePinnedMessage(data.id);
  };

  _handleDeleteTextMessage = (data) => {
    runInAction(() => {
      const tempMessage = this.messages.filter(
        message => message.uid !== data.id,
      );
      this.messages.splice(0);
      this.messages.push(...tempMessage);
    });
  };

  _handleNewQuestion = (data) => {
    const {
      fromId,
      timestamp,
    } = data;
    this.meeting.updateParticipant(data.asker);
    const question = this.meeting.addOrUpdateQuestion(data.question);
    if (!this.meeting.isLarge && !question.shouldHide) {
      const message = new QuestionMessage(this, fromId, timestamp, question);
      this.addMessageToQueue(message);
    }
  };

  _handleQuestionStatusChange = (data) => {
    const question = this.meeting.getQuestion(data.question_id);
    if (question) {
      question.emit('status_change', data);
    }
  };

  _handleQuestionVote = (data) => {
    const question = this.meeting.getQuestion(data.question_id);
    if (question) {
      question.emit('vote', data);
    }
  };

  _handlePlaybackUpdate = ({ timestamp, data }) => {
    this.meeting.playback.setVideo({ ...data, updated_at: timestamp });
  };

  // This event is only fired for CDN architecture
  _handlePlaylistContentSessionUpdated = (data) => {
    this.meeting.processComposedVideoSession(data);
  };

  /* Private */

  _addFirstUnreadReaction() {
    this._firstUnreadReaction = reaction(
      () => this.meeting.activeTab,
      () => this.markFirstUnreadMessage(),
      { fireImmediately: true },
    );
  }

  _addEventListeners() {
    clientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);

      // To make sure that we never add more than one listener for every event
      this.client.off(eventName, this[`_${handlerFnName}`]);
      this.client.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _addParticipantsStatusPoll() {
    if (STATUS_REFRESH_ENABLED && this.meeting.isSuperHost) {
      clearInterval(this._statusesPollInterval);
      this._statusesPollInterval = setInterval(() => {
        const activeCount = this.meeting.activeParticipants.length;
        if (activeCount > ACTIVE_PARTICIPANT_LIMIT) {
          this.setParticipantsStatus();
          this.meeting.track('member-status-poll');
        }
      }, PARTICIPANT_STATUS_POLL_INTERVAL * 1000);
    }
  }

  _createAgoraClient() {
    const {
      rtm_sdk_version: rtmSdkVersion,
    } = this.meeting.config || {};

    const AgoraClient = rtmSdkVersion === 2
      ? Agora.MessagingV2
      : Agora.Messaging;

    this._client = new AgoraClient(
      this.providerKeys,
      this.channelName,
      this.userId,
      this.token,
      { useProxy: settingsStore.cloudProxyEnabled },
    );
  }

  _createMessages(messages) {
    const newMessages = [];

    messages.forEach(item => {
      let message;
      if (item.message_type === 'poll') {
        const data = JSON.parse(item.body);
        message = new PollMessage(
          this,
          String(item.user_id),
          new Date(item.created_at).getTime(),
          data,
        );
      } else if (item.message_type === 'reactions') {
        const data = JSON.parse(item.body);
        message = new ReactionsMessage(
          this,
          String(item.user_id),
          new Date(item.created_at).getTime(),
          data,
        );
      } else {
        message = new TextMessage(
          this,
          String(item.user_id),
          new Date(item.created_at).getTime(),
          {
            body: item.body,
            toId: String(item.to_id || -1),
            isProxyUser: item.user_id < 0,
            proxyUserName: item.user_name,
            type: item.message_type,
            ...(item.message_type === 'pinned' && { pinned: true }),
          },
          false,
        );
      }

      if (
        !this._shouldIgnoreMessage(message)
        && item.message_type !== 'notice_board'
      ) {
        newMessages.push(message);
      }
    });

    this.setLastReadMessageIndex(
      this.lastReadMessageIndex + newMessages.length,
    );
    this.messages.unshift(...newMessages);
  }

  _removeEventListeners() {
    clientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this.client.off(eventName, this[`_${handlerFnName}`]);
    });
  }

  _shouldIgnoreMessage(message) {
    if (message.isMine) return false;

    // Hide negative message
    if (
      this.meeting.shouldHideNegativeContent
      && message.from.roleLevel < 2
      && isNegativeContent(message.body)
    ) {
      return true;
    }

    // spam control, host can see, other's can't
    if (
      this.meeting.type === 'webinar'
      && !this.meeting.isHost
      && !message.from?.isHost
      && !message.isMine
      && (
        containsHtml(message.body) || containsLink(message.body)
      )) {
      return true;
    }

    // Hide messages for ghost user
    return (
      this.meeting.isGhost
      && (
        message.from.roleLevel < 1
        || message.isFromSystem
      )
    );
  }

  _shouldNotify = (message) => {
    const { notificationLevel } = settingsStore;
    if (
      notificationLevel === ChatNotificationLevel.none
      || (
        (notificationLevel === ChatNotificationLevel.dm)
        && message.isPublic
      )
    ) {
      return false;
    }

    if (isWindowHidden()) {
      return true;
    }

    const sidebarTab = this.meeting.activeTab;
    if (sidebarTab === 'chat') {
      return false;
    }
    return true;
  };
}

export default Messaging;
