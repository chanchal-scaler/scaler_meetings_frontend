import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';

function createPlayback(slug, data) {
  return apiRequest(
    'POST',
    `${BASENAME}/${slug}/playback`,
    data,
  );
}

function deletePlayback(slug, data) {
  return apiRequest(
    'DELETE',
    `${BASENAME}/${slug}/playback`,
    data,
  );
}


export default {
  create: createPlayback,
  delete: deletePlayback,
};
