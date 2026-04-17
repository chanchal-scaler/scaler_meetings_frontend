import { ApiError } from '@common/errors';

export function legacyApiWrapper(requestFn, options = {}) {
  const { successKey = 'success', messageKey = 'message' } = options;
  return async (...args) => {
    const response = await requestFn(...args);
    if (!response[successKey]) {
      throw new ApiError(response[messageKey], {
        isFromServer: true,
        responseJson: response,
      });
    } else {
      return response;
    }
  };
}
