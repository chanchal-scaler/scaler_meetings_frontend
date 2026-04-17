export const PLAYLIST_CONTENT_TYPES = {
  composedVideo: 'ComposedVideo',
  problem: 'Problem',
  poll: 'Poll',
  cueCard: 'CueCard',
  instructorCard: 'CueCards::InstructorCard',
  alumniCard: 'CueCards::AlumniCard',
  htmlCard: 'CueCards::HtmlCard',
};

export const PLAYLIST_CONTENT_SESSION_STATUS = {
  waiting: 'waiting',
  processing: 'processing',
  playing: 'playing',
  failed: 'failed',
  ended: 'ended',
};

export const PLAYLIST_CONTENT_STATUS = {
  future: 'future',
  upcoming: 'upcoming',
  active: 'active',
  completed: 'completed',
  skipped: 'skipped',
};

export const DOUBT_RESOLUTION_DESCRIPTION = 'Doubt resolution window (2-3 '
  + 'mins break to resolve doubt)';

export const PLAYLIST_CONTENT_PLAYBACK_RATES = [
  1.25, 1.2, 1.1, 1, 0.9, 0.8, 0.75,
];

export const CUE_CARD_HEADING = {
  [PLAYLIST_CONTENT_STATUS.active]: 'Current Topic',
  [PLAYLIST_CONTENT_STATUS.upcoming]: 'Up Next >>',
  [PLAYLIST_CONTENT_STATUS.future]: 'Topic',
  [PLAYLIST_CONTENT_STATUS.completed]: 'Done',
  [PLAYLIST_CONTENT_STATUS.skipped]: 'Skipped',
};

export const COMPOSED_VIDEO_HEADING = {
  [PLAYLIST_CONTENT_STATUS.active]: 'Current Video',
  [PLAYLIST_CONTENT_STATUS.upcoming]: 'Video Up Next >>',
  [PLAYLIST_CONTENT_STATUS.future]: 'Video',
  [PLAYLIST_CONTENT_STATUS.completed]: 'Done',
  [PLAYLIST_CONTENT_STATUS.skipped]: 'Skipped',
};

export const PROBLEM_CARD_HEADING = {
  [PLAYLIST_CONTENT_STATUS.active]: 'Quiz',
  [PLAYLIST_CONTENT_STATUS.upcoming]: 'Quiz Up Next >>',
  [PLAYLIST_CONTENT_STATUS.future]: 'Quiz',
  [PLAYLIST_CONTENT_STATUS.completed]: 'Quiz Done',
  [PLAYLIST_CONTENT_STATUS.skipped]: 'Quiz Skipped',
};

export const POLL_CARD_HEADING = {
  [PLAYLIST_CONTENT_STATUS.active]: 'Poll',
  [PLAYLIST_CONTENT_STATUS.upcoming]: 'Poll Up Next >>',
  [PLAYLIST_CONTENT_STATUS.future]: 'Poll',
  [PLAYLIST_CONTENT_STATUS.completed]: 'Poll Done',
  [PLAYLIST_CONTENT_STATUS.skipped]: 'Poll Skipped',
};
