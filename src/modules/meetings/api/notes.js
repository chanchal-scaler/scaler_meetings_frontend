import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';

function updateNotes(slug, notes) {
  return apiRequest(
    'POST',
    `${BASENAME}/${slug}/notes`,
    { notes },
  );
}
export default {
  update: updateNotes,
};
