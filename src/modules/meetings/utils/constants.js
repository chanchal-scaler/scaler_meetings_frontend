import { DRONA_FEATURES } from './trackingEvents';

export const BASENAME = '/meetings';

export const APP_BASE = '/meetings-standalone';

export const API_V3_BASE = '/api/v3/meetings';

// Number of seconds after which students hand is automatically taken down
export const HAND_RAISE_TIMEOUT = 90; // In sec

export const JOIN_MODES = {
  normal: 'normal',
  companion: 'companion',
};

export const PROVIDERS = {
  Agora: 'agora',
};

export const STRINGS = {
  unsupportedBrowser: 'Your browser does not support audio/video calls',
  multipleLogin: 'Looks like you have already joined this meeting from another '
    + 'browser/device. Exit from that device and try again.',
  companionModeMessage: 'You are currently using Companion Mode. Activities '
    + 'like speaker, microphone, screen sharing are disabled '
    + 'to avoid any disturbances.',
};

export const WIDGET_ASPECT_RATIO = 16 / 9;

export const SINGLETONS_NAME = 'meeting-app';

export const CHECKLIST_ITEM_STATUSES = {
  success: 'success',
  error: 'error',
  warning: 'warning',
};

export const DEFAULT_CODEC_OPTIONS = {
  audio: 'opus',
  video: 'vp8',
};

export const DRONA_TROUBLESHOOTING_PDF_URL = (
  'https://content.interviewbit.com/meeting-platform-troubleshooting.pdf'
);

export const DRONA_TROUBLESHOOTING_GUIDE_URL = (
  'https://chatgpt.com/g/'
  + 'g-690218455f28819188a40e0d178d2b27-troubleshooting-drona'
);

export const SBAT_REGEX = /academy\/mentee-dashboard\/class\/([0-9]*)\/session/;

export const BOOKMARK_TYPES = {
  cueCards: 'cue_cards',
  question: 'question',
  default: 'default',
};

export const CUE_CARD_TRACKING = {
  cueCardView: 'M:CC:View on the card',
  cueCardForceStartPopup: `M:CC:View on the force start up with yes 
force start option and no cancel`,
  cueCardQuickViewPopup: 'M:CC:View on the quick view pop-up',
  cueCardStartTopic: 'M:CC:Click on the start of the topic',
  cueCardStopTopic: 'M:CC:Click on the stop topic button',
  cueCardReplayTopic: 'M:CC:Click on the replay topic button',
  cueCardQuickView: 'M:CC:Click on quick view',
  cueCardForceStart: 'M:CC:Click on force start',
  cueCardYesForceStart: `M:CC:Click on Yes, force start 
  on the force start pop up`,
  cueCardNoCancel: 'M:CC:Click on No, cancel on the force start pop up',
  quizCardQuickView: 'M:CC:Click on view quiz button',
  pollCardQuickView: 'M:CC:Click on view poll button',
  quizCardLaunch: 'M:CC:Click on launch quiz button',
  pollCardLaunch: 'M:CC:Click on launch poll button',
  quizDurationUpdate: 'M:CC:Update the quiz duration',
  pollDurationUpdate: 'M:CC:Update the poll duration',
  hideClassContent: `M:CC:Click on the hide class content buttonClick
on the hide class content button`,
  normalQuizLaunch: 'M:CC:Quiz Launch by previous capability',
  inClassBookmarking: `M:CC:Bookmarked during the class 
  using previous capability`,
  addNewBookmark: 'M:CC:Click on the add new bookmark button',
  addMissingBookmark: 'M:CC:Click on the missing bookmark button',
};

export const MEETING_ACTION_TRACKING = {
  meetingJoined: 'Drona Meeting Joined',
  meetingJoinFailed: 'Drona Meeting Join Failed',
  meetingVideoChannelJoinFailed: 'Drona Meeting Video Channel Join Failed',
  meetingMessagingJoined: 'Drona Meeting Messaging Joined',
  meetingMessagingJoinFailed: 'Drona Meeting Messaging Join Failed',
  meetingMessagingJoinInitiated: 'Drona Meeting Messaging Join Initiated',
  meetingMessagingVisible: 'Drona Meeting Messaging Visible',
  audioVideoShared: 'Drona Audio Video Shared',
  audioVideoShareFailed: 'Drona Audio Video Share Failed',
  stoppedAudioVideo: 'Drona Stopped Audio Video',
  stopAudioVideoFailed: 'Drona Stop Audio Video Failed',
  screenShared: 'Drona Screen Shared',
  screenShareFailed: 'Drona Screen Share Failed',
  stopScreenShare: 'Drona Stop Screen Share',
  stopScreenShareFailed: 'Drona Stop Screen Share Failed',
  dronaLeaveMeeting: 'Drona Leave Button',
  callQualityLog: 'Drona Call Quality Log',
  downloadSpeedLog: 'Drona Download Speed Log',
  networkRestricted: 'Proxy Enabled on Drona Meeting',
  quizViewedByLearner: 'Drona Quiz Viewed By Learner',
  quizViewedLateByLearner: 'Drona Quiz Viewed Late By Learner',
  quizAnswerSelected: 'Drona Quiz Answer Selected',
  quizSubmissionToBackend: 'Drona Quiz Answer Submitted',
  quizSendToBackendFailed:
    'Drona Quiz Submission To Backend Failed',
  archiveVideoError: 'Drona Archive Video Error',
  platformFeedbackSubmitted: 'Drona Platform Feedback Form Submitted',
  platformFeedbackOpened: 'Drona Platform Feedback Button Clicked',
  platformFeedbackSubmitError: 'Drona Platform Feedback Submit Error',
  unableToJoinMeeting: 'Drona Meeting Unable To Join',
  authErrorOnDrona: 'Drona Meeting Auth related error',
};

export const DEFAULT_MEETING_CONFIG = {
  sdk_version: 4,
  standard_streaming: true,
  rtm_sdk_version: 1,
};

export const MEETING_TABS = {
  chat: 'chat',
  notes: 'notes',
  people: 'people',
  questions: 'questions',
  bookmarks: 'bookmarks',
  playlist: 'playlist',
  externalLinks: 'external_links',
  noticeBoard: 'notice_board',
};

export const PROXY_CHAT_MODAL_STATES = {
  genericChat: 'genericChat',
  cueCardBasedChat: 'cueCardBasedChat',
  customChat: 'customChat',
};

export const PROXY_CHAT_MODAL_TO_FEATURE_MAP = {
  [PROXY_CHAT_MODAL_STATES.genericChat]: DRONA_FEATURES.proxyGenericChat,
  [PROXY_CHAT_MODAL_STATES.cueCardBasedChat]: DRONA_FEATURES.proxyCueBasedChat,
  [PROXY_CHAT_MODAL_STATES.customChat]: DRONA_FEATURES.proxyCustomChat,
};

export const PROXY_QUESTION_MODAL_STATES = {
  cueCardBasedQuestion: 'cueCardBasedQuestion',
  customQuestion: 'customQuestion',
  genericQuestion: 'genericQuestion',
};

export const PROXY_QUESTION_MODAL_TO_FEATURE_MAP = {
  [PROXY_QUESTION_MODAL_STATES.cueCardBasedQuestion]:
    DRONA_FEATURES.proxyCueBasedQuestion,
  [PROXY_QUESTION_MODAL_STATES.customQuestion]:
    DRONA_FEATURES.proxyCustomQuestion,
  [PROXY_QUESTION_MODAL_STATES.genericQuestion]:
    DRONA_FEATURES.proxyGenericQuestion,
};

export const MEETING_RESOLUTION_CATEGORY = {
  hd: 921600,
  fhd: 2073600,
  twoK: 3686400,
};
