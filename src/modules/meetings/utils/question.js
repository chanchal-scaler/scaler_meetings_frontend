export const MIN_QUESTION_LENGTH = 20;

export const MAX_QUESTION_LENGTH = 450;

// Time after which user can ask question again in sec
export const QUESTION_RATE_LIMIT_TIMEOUT = (
  parseInt(window.__MEETING_CONFIG__?.questionRateLimitTimeout, 10)
  || 180
);

export const QuestionStatus = {
  pending: 'pending',
  ongoing: 'ongoing', // Client side only status
  responded: 'responded',
  archived: 'archived',
  deleted: 'deleted',
  answerApproved: 'answer_approved',
};

export const QuestionResponderType = {
  manual: 'manual',
  bot: 'bot',
};

export const QuestionSort = {
  votes: 'votes',
  date: 'date',
};

export const QuestionFilter = {
  all: 'all',
  mine: 'mine',
};

export const finalQuestionStatuses = [
  QuestionStatus.responded, QuestionStatus.archived, QuestionStatus.deleted,
  QuestionStatus.answerApproved,
];

export const botResponseFeedbackTypes = {
  accept: 'accept',
  reject: 'reject',
};
