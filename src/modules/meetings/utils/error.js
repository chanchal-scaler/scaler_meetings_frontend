import { MEETING_ACTION_TRACKING } from '~meetings/utils/constants';
import { toast } from '@common/ui/general/Toast';
import { UserAuthenticationError } from '~meetings/errors';
import analytics from '~meetings/analytics';

export const SESSION_DOES_NOT_EXIST_MESSAGE = `You seemed to have logged out, `
+ `please refresh and re-login to access this feature.`;

export const SESSION_TIMEOUT_MESSAGE = `Your session expired. `
+ `Please sign in again to continue.`;

export const USER_LOGGED_OUT_MESSAGE = `You need to sign in or sign `
+ `up before continuing.`;

export const ACCESS_DENIED_MESSAGE = `You don't have access to this meeting, `
+ `please refresh and re-login to access this feature.`;

export const FEATURE_ACCESS_DENIED_MESSAGE = `You don't have access to `
+ `use this feature, please try refreshing and re-login to access.`;

export function handleMeetingApiError(error) {
  if (error?.response?.status?.toString()?.charAt(0) === '4') {
    switch (error?.response?.status) {
      case 401:
        switch (error?.responseJson?.error) {
          case SESSION_TIMEOUT_MESSAGE:
          case USER_LOGGED_OUT_MESSAGE:
            toast.show({
              message: error?.responseJson?.error,
              type: 'error',
            });
            analytics.view(
              MEETING_ACTION_TRACKING.authErrorOnDrona,
              'Live Meeting', { error: error?.responseJson?.error },
            );
            throw new UserAuthenticationError(error?.responseJson?.error);
          default:
            throw error;
        }
      case 404:
        switch (error?.responseJson?.error) {
          case ACCESS_DENIED_MESSAGE:
          case FEATURE_ACCESS_DENIED_MESSAGE:
            toast.show({
              message: error?.responseJson?.error,
              type: 'error',
            });
            analytics.view(
              MEETING_ACTION_TRACKING.authErrorOnDrona,
              'Live Meeting', { error: error?.responseJson?.error },
            );
            throw new UserAuthenticationError(error?.responseJson?.error);
          default:
            throw error;
        }
      case 403:
        switch (error?.responseJson?.error) {
          case FEATURE_ACCESS_DENIED_MESSAGE:
            toast.show({
              message: error?.responseJson?.error,
              type: 'error',
            });
            analytics.view(
              MEETING_ACTION_TRACKING.authErrorOnDrona,
              'Live Meeting', { error: error?.responseJson?.error },
            );
            throw new UserAuthenticationError(error?.responseJson?.error);
          default:
            throw error;
        }
      default:
        throw error;
    }
  }
}
