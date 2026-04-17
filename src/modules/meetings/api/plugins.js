import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';

function getAllPlugins(slug) {
  return apiRequest('GET', `${BASENAME}/${slug}/plugins`);
}

export default {
  getList: getAllPlugins,
};
