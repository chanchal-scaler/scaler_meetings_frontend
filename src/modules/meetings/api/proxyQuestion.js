import { API_V3_BASE } from '~meetings/utils/constants';
import { apiRequest } from '@common/api/utils';

function createQuestion(meetingSlug, userName, message) {
  return apiRequest(
    'POST',
    `${API_V3_BASE}/${meetingSlug}/proxy_questions/`,
    {
      proxy: {
        user_name: userName,
        body: message,
      },
    },
  );
}

function getRandomName() {
  return apiRequest('GET', '/api/v3/random-names');
}

export default {
  createQuestion,
  getRandomName,
};
