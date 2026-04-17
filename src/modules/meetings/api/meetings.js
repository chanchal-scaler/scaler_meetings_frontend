import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';
import {
  getAttribution,
  setAttribution,
} from '@common/vanilla_ui/tracking/attribution';
import { INTENTS } from '@common/vanilla_ui/tracking/constants';

const getMeetingAttributions = () => {
  setAttribution(
    INTENTS.MEETING_JOINED,
  );

  const data = getAttribution() || {};
  const result = {};
  Object.keys(data).forEach((key) => {
    result[`attributions[${key}]`] = data[key];
  });

  return result;
};

function createMeetingParticipant(slug, role, password) {
  return apiRequest(
    'POST',
    `${BASENAME}/${slug}/participants`,
    { role, password },
  );
}

function getMeetingItem(slug) {
  return apiRequest('GET', `${BASENAME}/${slug}/item`);
}

function getMeetingParticipants(slug) {
  return apiRequest('GET', `${BASENAME}/${slug}/participants`);
}

function getMeetingMessages(slug, ts) {
  return apiRequest('GET', `${BASENAME}/${slug}/messages`, { ts });
}

function getMeetingSession(slug, cloudProxyEnabled) {
  return apiRequest('GET', `${BASENAME}/${slug}/live-session`, {
    cloud_proxy_enabled: cloudProxyEnabled,
    ...getMeetingAttributions(),
  });
}

function findMeetingParticipants(slug, query) {
  return apiRequest(
    'GET',
    `${BASENAME}/${slug}/participants/search`,
    { query },
  );
}

function acknowledgeAiSidekickBanner(meetingSlug) {
  return apiRequest(
    'PUT',
    `${BASENAME}/${meetingSlug}/questions/disable-new-auto-response-badge`,
  );
}
export default {
  acknowledgeAiSidekickBanner,
  createParticipant: createMeetingParticipant,
  getItem: getMeetingItem,
  getParicipants: getMeetingParticipants,
  getMessages: getMeetingMessages,
  getSession: getMeetingSession,
  findParticipants: findMeetingParticipants,
};
