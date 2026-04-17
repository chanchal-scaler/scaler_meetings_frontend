import { apiRequest } from '@common/api/utils';
import { handleMeetingApiError } from '~meetings/utils/error';

export async function meetingApiRequest(
  method, path, body = null, options = {},
) {
  try {
    const res = await apiRequest(method, path, body, options);
    return res;
  } catch (error) {
    handleMeetingApiError(error);
    return null;
  }
}

export async function meetingApiRequestWithToken(
  method, path, body = null, options = {},
) {
  return meetingApiRequest(method, path, body, {
    ...options,
    headers: {
      ...options.headers,
      'X-User-Token': window.__AUTH_TOKEN__,
    },
  });
}
