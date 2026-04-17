import React from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { ScreenShareErrorTypes } from '~meetings/utils/media';
import DefaultError from './DefaultError';
import NotReadableError from './NotReadableError';
import PermissionDeniedSystemError from './PermissionDeniedSystemError';
import PermissionDeniedUserError from './PermissionDeniedUserError';

function ScreenShareError({ meetingStore: store }) {
  const { meeting } = store;
  const { videoBroadcasting } = meeting;
  const { screenShareError } = videoBroadcasting;
  const { message } = screenShareError;

  switch (message) {
    case ScreenShareErrorTypes.PermissionDeniedSystem:
    case ScreenShareErrorTypes.DeviceNotFound:
      return (
        <PermissionDeniedSystemError
          actionFn={videoBroadcasting.openSystemPreferences}
        />
      );
    case ScreenShareErrorTypes.PermissionDeniedUser:
    case ScreenShareErrorTypes.PermissionDeniedAgent:
      return (
        <PermissionDeniedUserError
          actionFn={videoBroadcasting.resetScreenShareError}
        />
      );
    case ScreenShareErrorTypes.NotReadableError:
      return (
        <NotReadableError
          actionFn={videoBroadcasting.resetScreenShareError}
        />
      );
    default:
      return (
        <DefaultError
          actionFn={videoBroadcasting.resetScreenShareError}
        />
      );
  }
}

export default React.memo(mobxify('meetingStore')(ScreenShareError));
