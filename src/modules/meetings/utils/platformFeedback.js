import { ONE_MINUTE, ONE_SECOND } from '@common/utils/date';

export const PLATFORM_FEEDBACK_STAGES = {
  details: 'PLATFORM_FEEDBACK_DETAILS',
  submitted: 'PLATFORM_FEEDBACK_SUBMITTED',
};

export const INITIAL_NUDGE_TIMEOUT = 20 * ONE_MINUTE;
export const NUDGE_VISIBILITY_TIMEOUT = 2 * ONE_MINUTE;
export const SUBMITTED_STATE_TIMEOUT = 3 * ONE_SECOND;

const RATING_FORM_TITLE = 'Rate audio and video experience';
const FEEDBACK_FORM_TITLE = 'Any additional feedback';

export const MAX_RATING = 5;

export const formatFeedbackResponse = ({ feedbackForms, rating, feedback }) => {
  const result = { responses: [] };
  feedbackForms.forEach((form) => {
    if (form?.title === RATING_FORM_TITLE) {
      result.responses.push({
        id: form?.id,
        value: rating,
      });
    } else if (form?.title === FEEDBACK_FORM_TITLE) {
      result.responses.push({
        id: form?.id,
        value: feedback,
      });
    }
  });
  return result;
};
