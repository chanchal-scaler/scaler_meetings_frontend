export const MessageTypes = {
  text: 'text',
  proxyMessage: 'proxy_message',
  event: 'event',
  poll: 'poll',
  reactions: 'reactions',
  question: 'question',
  nudge: 'nudge',
  noticeBoard: 'notice_board',
};

export const ChatNotificationLevel = {
  all: 'all',
  dm: 'dm',
  none: 'none',
};

export const ChatPermissionLevel = {
  all: 'all',
  public_and_hosts: 'public_and_hosts',
  public: 'public',
  hosts: 'hosts',
  none: 'none',
};

// Number of active participants after which we should start polling for
// online status
export const ACTIVE_PARTICIPANT_LIMIT = 450;

export const CHAT_RATE_LIMIT_TIMEOUT = 30; // in sec

export const STATUS_REFRESH_ENABLED = false;

export const MAX_MESSAGE_LENGTH = 1200;

export function publicMessagesAllowed(permissionLevel) {
  return [
    ChatPermissionLevel.all,
    ChatPermissionLevel.public_and_hosts,
    ChatPermissionLevel.public,
  ].includes(permissionLevel);
}

export const reactionNotificationStatus = {
  enabled: 'enabled',
  disabled: 'disabled',
};

export const REACTION_MESSAGES_DICTIONARY = [
  'yes', 'no', 'gotit', 'yeah', 'ok', 'okay',
];

const systemMessageTypes = [
  MessageTypes.reactions,
  MessageTypes.question,
  MessageTypes.poll,
  MessageTypes.nudge,
];

export function isSystemMessage(messageType) {
  return systemMessageTypes.includes(messageType);
}
