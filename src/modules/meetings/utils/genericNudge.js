/* eslint-disable max-len */
import { DRONA_FEATURES } from './trackingEvents';
import { ONE_HOUR, ONE_MINUTE } from '@common/utils/date';
import LocalStorage from '@common/lib/localStorage';

const ls = LocalStorage.getInstance('v1/drona-generic-nudges');

export const GENERIC_NUDGE_ADDED_EVENT = 'GENERIC_NUDGE_ADDED_EVENT';
export const GENERIC_NUDGE_REMOVED_EVENT = 'GENERIC_NUDGE_REMOVED_EVENT';

export const QUIZ_MISSED_NUDGE_TIMEOUT = 2 * ONE_MINUTE;
export const POLL_MISSED_NUDGE_TIMEOUT = 2 * ONE_MINUTE;

export const GENERIC_NUDGE_TYPES = {
  QuizMissedNudge: 'QuizMissedNudge',
  PollMissedNudge: 'PollMissedNudge',
  QuizOngoingNudge: 'QuizOngoingNudge',
  PollOngoingNudge: 'PollOngoingNudge',
  PollAttemptedNudge: 'PollAttemptedNudge',
  QuizAttemptedNudge: 'QuizAttemptedNudge',
  HabitBuildingNudgeLive: 'HabitBuildingNudgeLive',
  HabitBuildingNudgeArchive: 'HabitBuildingNudgeArchive',
};

// Stores snoozing data.
export const NUDGE_SNOOZING_CONFIG = {
  [GENERIC_NUDGE_TYPES.QuizMissedNudge]: {
    numberOfShowsAllowed: Number.MAX_SAFE_INTEGER,
    snoozeTime: 3 * ONE_HOUR,
  },
  [GENERIC_NUDGE_TYPES.PollMissedNudge]: {
    numberOfShowsAllowed: Number.MAX_SAFE_INTEGER,
    snoozeTime: 3 * ONE_HOUR,
  },
  [GENERIC_NUDGE_TYPES.QuizOngoingNudge]: {
    numberOfShowsAllowed: Number.MAX_SAFE_INTEGER,
    snoozeTime: 3 * ONE_HOUR,
  },
  [GENERIC_NUDGE_TYPES.PollOngoingNudge]: {
    numberOfShowsAllowed: Number.MAX_SAFE_INTEGER,
    snoozeTime: 3 * ONE_HOUR,
  },
  [GENERIC_NUDGE_TYPES.PollAttemptedNudge]: {
    numberOfShowsAllowed: Number.MAX_SAFE_INTEGER,
    snoozeTime: 3 * ONE_HOUR,
  },
  [GENERIC_NUDGE_TYPES.QuizAttemptedNudge]: {
    numberOfShowsAllowed: Number.MAX_SAFE_INTEGER,
    snoozeTime: 3 * ONE_HOUR,
  },
  [GENERIC_NUDGE_TYPES.HabitBuildingNudgeLive]: {
    numberOfShowsAllowed: Number.MAX_SAFE_INTEGER,
    snoozeTime: 3 * ONE_HOUR,
  },
  [GENERIC_NUDGE_TYPES.HabitBuildingNudgeArchive]: {
    numberOfShowsAllowed: Number.MAX_SAFE_INTEGER,
    snoozeTime: 3 * ONE_HOUR,
  },
};

// Stores priority of nudges, Higher number corresponds to more priority.
export const NUDGE_PRIORITY = {
  [GENERIC_NUDGE_TYPES.QuizMissedNudge]: 1,
  [GENERIC_NUDGE_TYPES.PollMissedNudge]: 0,
  [GENERIC_NUDGE_TYPES.QuizOngoingNudge]: 1,
  [GENERIC_NUDGE_TYPES.PollOngoingNudge]: 0,
  [GENERIC_NUDGE_TYPES.PollAttemptedNudge]: 2,
  [GENERIC_NUDGE_TYPES.QuizAttemptedNudge]: 3,
  [GENERIC_NUDGE_TYPES.HabitBuildingNudgeLive]: 3,
  [GENERIC_NUDGE_TYPES.HabitBuildingNudgeArchive]: 3,
};

// for mixpanel tracking
export const NUDGE_FEATURE = {
  [GENERIC_NUDGE_TYPES.QuizMissedNudge]: DRONA_FEATURES.quiz,
  [GENERIC_NUDGE_TYPES.PollMissedNudge]: DRONA_FEATURES.poll,
  [GENERIC_NUDGE_TYPES.QuizOngoingNudge]: DRONA_FEATURES.quiz,
  [GENERIC_NUDGE_TYPES.PollOngoingNudge]: DRONA_FEATURES.poll,
  [GENERIC_NUDGE_TYPES.PollAttemptedNudge]: DRONA_FEATURES.poll,
  [GENERIC_NUDGE_TYPES.QuizAttemptedNudge]: DRONA_FEATURES.quiz,
  [GENERIC_NUDGE_TYPES.HabitBuildingNudgeLive]: DRONA_FEATURES.habitBuildingNudgeLive,
  [GENERIC_NUDGE_TYPES.HabitBuildingNudgeArchive]: DRONA_FEATURES.habitBuildingNudgeRecording,
};

export function addNudgeToView(nudge) {
  const { nudgeType } = nudge || {};
  if (!nudgeType) {
    throw new Error(
      'Invalid Nudge Params Provided. Required: NudgeType',
    );
  }

  window.dispatchEvent(
    new CustomEvent(
      GENERIC_NUDGE_ADDED_EVENT,
      { detail: nudge },
    ),
  );
}

export function removeNudgeFromView() {
  window.dispatchEvent(
    new CustomEvent(
      GENERIC_NUDGE_REMOVED_EVENT,
    ),
  );
}

function canShowNudgeBasedOnPriority({ currentNudge, newNudgeType }) {
  if (!currentNudge) return true;

  const currentNudgePriority = NUDGE_PRIORITY[currentNudge?.nudgeType];
  const newNudgePriority = NUDGE_PRIORITY[newNudgeType];

  if (newNudgePriority >= currentNudgePriority) return true;

  return false;
}

function canShowNudgeBasedOnSnoozing({ nudgeType }) {
  const engagementNudgeDetails = ls[nudgeType] || {
    lastShownAt: null, showCount: 0,
  };
  const snoozeTime = NUDGE_SNOOZING_CONFIG[nudgeType]?.snoozeTime;
  const numShowsAllowed = NUDGE_SNOOZING_CONFIG[
    nudgeType
  ]?.numberOfShowsAllowed;

  if (!engagementNudgeDetails.lastShownAt) return true;

  const nudgeLastShownAt = new Date(engagementNudgeDetails.lastShownAt);
  const nudgeShownCount = engagementNudgeDetails.showCount;

  if (nudgeShownCount >= numShowsAllowed) return false;

  const todaysDate = new Date();
  return (todaysDate.getTime() - nudgeLastShownAt.getTime()) > snoozeTime;
}

export function canShowNudge({ currentNudge, newNudgeType }) {
  return canShowNudgeBasedOnPriority({
    currentNudge,
    newNudgeType,
  }) && canShowNudgeBasedOnSnoozing({ nudgeType: newNudgeType });
}

export function recordNudgeShown(nudgeType) {
  const todaysDate = new Date();

  const engagementNudgeDetails = ls[nudgeType] || {
    lastShownAt: null, showCount: 0,
  };

  ls[nudgeType] = {
    lastShownAt: todaysDate,
    showCount: engagementNudgeDetails.showCount + 1,
  };
}
