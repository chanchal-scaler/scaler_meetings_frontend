import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';

function loadAttachments(slug, token) {
  return apiRequest(
    'GET', `${BASENAME}/${slug}/attachments`, { token },
  );
}

function deleteAttachment(id, slug, token) {
  return apiRequest(
    'DELETE', `${BASENAME}/${slug}/attachments/${id}`, { token },
  );
}

export default {
  loadAttachments,
  deleteAttachment,
};
