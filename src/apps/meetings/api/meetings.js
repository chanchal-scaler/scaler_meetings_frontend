import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';

function createMeeting(data) {
  return apiRequest('POST', `${BASENAME}/create`, { meeting: data }, {
    requireJwt: true,
  });
}

function getMeetings() {
  return apiRequest('GET', `${BASENAME}/list`);
}

function updateMeeting(slug, data) {
  return apiRequest('PUT', `${BASENAME}/${slug}/update`, { meeting: data }, {
    requireJwt: true,
  });
}

export default {
  create: createMeeting,
  getList: getMeetings,
  update: updateMeeting,
};
