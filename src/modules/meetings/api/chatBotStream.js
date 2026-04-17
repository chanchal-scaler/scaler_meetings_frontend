import { apiRequest } from '@common/api/utils';

const CHATBOT_SLUG = 'drona-auto-responses-chatbot';

function initChatStream() {
  return apiRequest(
    'POST',
    `/api/v3/assisted_requests/chatbots/${CHATBOT_SLUG}/init`,
  );
}

function createChatResponseStream({
  questionText,
  questionId,
}) {
  return apiRequest(
    'POST',
    `/api/v3/assisted_requests/chatbots/${CHATBOT_SLUG}/stream`,
    {
      query: questionText,
      use_conversation_history: false,
      options: {
        owner_type: 'Comment',
        owner_id: questionId,
      },
    },
  );
}

export default {
  initChatStream,
  createChatResponseStream,
};
