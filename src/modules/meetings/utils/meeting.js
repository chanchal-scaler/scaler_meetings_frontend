import { isString } from '@common/utils/type';

const meetingTypeLabelsMap = {
  lecture_hall: 'Lecture',
  conference: 'Conference',
  webinar: 'Masterclass',
  timed_interaction: 'Interactive Session',
  interaction: 'Interactive Session',
};

const meetingStatusLabelsMap = {
  upcoming: 'Upcoming',
  ongoing: 'Live',
  completed: 'Archive',
};

const meetingChannelsMap = {
  lecture_hall: ['messaging', 'video_broadcasting'],
  conference: ['messaging', 'video_broadcasting'],
  webinar: ['messaging', 'video_broadcasting'],
  timed_interaction: ['messaging', 'video_broadcasting'],
  interaction: ['messaging', 'video_broadcasting'],
};

const forcedStatusMap = {
  upcoming: ['ongoing'],
  ongoing: ['completed'],
  completed: [],
};

export const UnmuteAccessLevel = {
  all: 'all',
  video: 'video',
  audio: 'audio',
};

export const MeetingStatus = {
  upcoming: 'upcoming',
  ongoing: 'ongoing',
  completed: 'completed',
};

export const SocketStatus = {
  /**
   * Waiting to establish socket connection
   */
  waiting: 'waiting',
  /**
   * Attempting to establish socket connection
   */
  connecting: 'connecting',
  /**
   * Connection established and is active
   */
  connected: 'connected',
  /**
   * Active connection was disconnected. Socket will try to reconnect
   */
  disconnected: 'disconnected',
  /**
   * Attempt to connect failed
   */
  error: 'error',
  /**
   * Server decided to not establish connection most probably because user
   * does not have permission to join the channel
   */
  rejected: 'rejected',
};

export function normalizeMessage(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const NEGATIVE_CONTENT_DICTIONARY = [
  'recording',
  'recorded',
  'can\'t see',
  'cannot see',
  'can\'t hear',
  'cannot hear',
  'waste',
  'boring',
  'not visible',
  'not audible',
  'screen gone',
  'gone screen',
  'bad teach',
  'worst teach',
  'bad lecture',
  'worst lecture',
  'bad class',
  'worst class',
  'no audio',
  'no video',
  'audio gone',
  'video gone',
  'disappoint',
  'dissapoint',
  'disapoint',
  'loop',
  'live',
  'shit',
  'repeat',
  'no voice',
  'voice gone',
  'voice issue',
  'audio issue',
  'video issue',
  'redundancy',
  'redundant',
  'downsizing',
  'downsized',
  'firing',
  'fired',
  'layoffs',
  'layoff',
  'workforce reduction',
  'job cuts',
  'staff reduction',
  'termination',
  'terminated',
  'dismissal',
  'dismissed',
  'removed',
  'removal',
  'job loss',
  'job cut',
  'recession',
  'sacked',
  'scam',
  'fake',
  'lies',
  'news',
  'booted',
  'fuck',
  'acting',
  'recrded',
  'lying',
  'lieing',
  'record',
  'jhooth',
  'old content',
  'playing video',
  'oversmart',
  'expensive',
  'timepass',
  'wasting',
  'useless',
  'dick',
  'suck up',
  'sexy',
  'hot',
].map(word => new RegExp(`\\b${word}\\b`, 'i'));

export function screenMaximisedDefaultValue(type) {
  return ['lecture_hall', 'webinar'].includes(type);
}

export function canCreatePollAndQuiz(type) {
  return ['lecture_hall', 'webinar', 'conference'].includes(type);
}
export function canCreateSurvey(type) {
  return ['webinar'].includes(type);
}

export function canTakeDoubts(type) {
  return ['lecture_hall', 'webinar'].includes(type);
}

export function canCreateBookmarks(type) {
  return ['conference', 'lecture_hall', 'webinar'].includes(type);
}

export function meetingChannels(type) {
  return meetingChannelsMap[type];
}

export function meetingTypeLabel(type) {
  return meetingTypeLabelsMap[type] || 'Meeting';
}

export function meetingStatusLabel(status) {
  return meetingStatusLabelsMap[status];
}

export function canNavigate(currentStatus, navigationStatus, forced = false) {
  if (currentStatus === navigationStatus) {
    return true;
  } else {
    return forced && forcedStatusMap[currentStatus].includes(navigationStatus);
  }
}

export function canPreTestSetup(type) {
  return ['lecture_hall', 'webinar'].includes(type);
}

export function canRaiseHand(type) {
  return ['lecture_hall', 'webinar'].includes(type);
}

export function slugFromLink(url) {
  if (!url) return null;
  const slugRegex = /i\/([^/]+)/;
  const matches = url.match(slugRegex);
  return matches && matches[1];
}

export function canSetProxy(type) {
  return type !== 'webinar';
}

export function canHideNegativeContent(type) {
  return ['lecture_hall', 'webinar'].includes(type);
}

export function isNegativeContent(text) {
  if (isString(text)) {
    return NEGATIVE_CONTENT_DICTIONARY.some(pattern => pattern.test(text));
  } else {
    return false;
  }
}

export function isPreRecordedCourse() {
  return window.__PRE_RECORDED_COURSE__ === 'true';
}
