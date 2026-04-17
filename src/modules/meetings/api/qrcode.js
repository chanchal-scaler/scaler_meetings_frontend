import { apiRequest } from '@common/api/utils';
import { BASENAME } from '~meetings/utils/constants';


function getQRCode(slug) {
  return apiRequest(
    'GET',
    `${BASENAME}/${slug}/attachments/qr-code`,
  );
}

export default {
  getQRCode,
};
