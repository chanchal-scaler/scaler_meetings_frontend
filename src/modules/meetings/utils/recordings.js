/* eslint-disable import/prefer-default-export */
import { getDaysDifference } from '@common/utils/date';
import { isNumber } from '@common/utils/type';

// Do not resume video if their saved `resumeAt` is less than 60 seconds
// from starting or beginning
const RESUME_OFFSET = 60;

// Expire resume at if it is more than 15 days old
const RESUME_AT_EXPIRY_TIME = 15;

/**
 * @param {Number} duration Total video duration in seconds
 * @param {Number} resumeAt Stored resume at
 */
export function canResumePlayback({
  duration,
  resumeAt: _resumeAt,
  savedAt,
}) {
  if (getDaysDifference(Date.now(), savedAt) > RESUME_AT_EXPIRY_TIME) {
    return false;
  }

  const resumeAt = Math.max(
    Math.min(duration, isNumber(_resumeAt) ? _resumeAt : 0),
    0,
  );

  const minResumeAt = RESUME_OFFSET;
  const maxResumeAt = Math.min(duration - RESUME_OFFSET, 0.99 * duration);

  return (resumeAt > minResumeAt && resumeAt < maxResumeAt);
}
