import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';

function startRecording(slug, order) {
  return apiRequest('POST', `${BASENAME}/${slug}/recordings/`, { order });
}

function stopRecording(slug) {
  return apiRequest('POST', `${BASENAME}/${slug}/recordings/stop`);
}

function updateRecording(slug, order) {
  return apiRequest('PUT', `${BASENAME}/${slug}/recordings/`, { order });
}

export default {
  start: startRecording,
  stop: stopRecording,
  update: updateRecording,
};
