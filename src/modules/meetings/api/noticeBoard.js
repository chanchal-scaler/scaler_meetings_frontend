import { API_V3_BASE, BASENAME } from '~meetings/utils/constants';
import {
  meetingApiRequest,
  meetingApiRequestWithToken,
} from './baseMeetingApi';

function fetchTemplates(slug) {
  return meetingApiRequestWithToken(
    'GET',
    `${API_V3_BASE}/${slug}/notice_board_templates`,
  );
}

function pinMeetingMessage(slug, data) {
  return meetingApiRequest(
    'POST',
    `${BASENAME}/${slug}/pin`,
    { data },
  );
}

function unpinMeetingMessage(slug, id) {
  return meetingApiRequest('DELETE', `${BASENAME}/${slug}/pin/${id}`);
}

export default {
  pinMessage: pinMeetingMessage,
  unpinMessage: unpinMeetingMessage,
  fetchTemplates,
};
