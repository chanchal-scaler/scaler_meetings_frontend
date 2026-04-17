import { apiRequest } from '@common/api/utils';
import { API_V3_BASE } from '~meetings/utils/constants';

function sendProxyMessage(meetingSlug, userName, message) {
  return apiRequest(
    'POST',
    `${API_V3_BASE}/${meetingSlug}/proxy_messages/`,
    {
      proxy: {
        user_name: userName,
        message,
      },
    },
  );
}

function getRandomName() {
  return apiRequest('GET', '/api/v3/random-names');
}

function regenerateMessage(
  meetingSlug,
  message,
  type = 'generic',
  triggerType,
  triggerId,
) {
  return apiRequest(
    'PUT',
    `${API_V3_BASE}/${meetingSlug}/proxy_messages/`,
    {
      proxy: {
        message,
        type,
        trigger_type: triggerType,
        trigger_id: triggerId,
      },
    },
  );
}

function getGenericProxyMessages(meetingSlug) {
  return apiRequest(
    'GET',
    `${API_V3_BASE}/${meetingSlug}/proxy_messages/`,
    {
      'proxy[type]': 'generic',
      'proxy[trigger_type]': null,
      'proxy[trigger_id]': null,
    },
  );
}

export default {
  sendMessage: sendProxyMessage,
  getRandomName,
  getGenericProxyMessages,
  regenerateMessage,
};
