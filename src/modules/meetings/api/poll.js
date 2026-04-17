import { BASENAME } from '~meetings/utils/constants';
import { meetingApiRequest } from './baseMeetingApi';

function getPollList(slug) {
  return meetingApiRequest('GET', `${BASENAME}/${slug}/polls`);
}

function createPoll(slug, data) {
  return meetingApiRequest('POST', `${BASENAME}/${slug}/polls`, data);
}

function updatePoll(slug, pollId, data) {
  return meetingApiRequest(
    'PUT',
    `${BASENAME}/${slug}/polls/${pollId}`,
    data,
  );
}

function publishPoll(slug, pollId) {
  return meetingApiRequest(
    'POST', `${BASENAME}/${slug}/polls/${pollId}/publish`,
  );
}

export default {
  create: createPoll,
  update: updatePoll,
  getList: getPollList,
  publish: publishPoll,
};
