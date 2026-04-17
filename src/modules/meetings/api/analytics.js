import { apiRequest } from '@common/api/utils';
import { API_V3_BASE } from '~meetings/utils/constants';

function getUserTraits() {
  return apiRequest(
    'GET',
    '/analytics/',
  );
}

function getMeetingTraits(slug) {
  return apiRequest(
    'GET',
    `${API_V3_BASE}/${slug}/analytics/`,
  );
}

export default {
  getUserTraits,
  getMeetingTraits,
};
