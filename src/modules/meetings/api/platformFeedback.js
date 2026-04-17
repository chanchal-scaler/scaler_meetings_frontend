import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';

function submitPlatformFeedback({
  meetingSlug, payload,
}) {
  return apiRequest('POST', `${BASENAME}/${meetingSlug}/feedback`, payload);
}

export default {
  submitFeedback: submitPlatformFeedback,
};
