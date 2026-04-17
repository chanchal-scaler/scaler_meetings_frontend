import { fromTemplate } from '@common/utils/string';

export const MEDIA_SOURCE_ERRORS = {
  PERMISSION_NOT_GRANTED: 'PERMISSION_NOT_GRANTED',
  MEDIA_NOT_SUPPORTED: 'MEDIA_NOT_SUPPORTED',
  MEDIA_NOT_FOUND: 'MEDIA_NOT_FOUND',
  MEDIA_NOT_SELECTED: 'MEDIA_NOT_SELECTED',
  MEDIA_ALREADY_IN_USE: 'MEDIA_ALREADY_IN_USE',
  MEDIA_SOURCE_NOT_ACTIVE: 'MEDIA_SOURCE_NOT_ACTIVE',
  ABORT_ERROR: 'ABORT_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
};

const messagesMap = {
  PERMISSION_NOT_GRANTED: 'Please grant access to use your {{device}}, '
    + 'if already granted, please refresh the page.',
  MEDIA_NOT_SUPPORTED: '{{device}} is not supported, '
    + 'please select another {{device}} or try restarting your browser/device',
  MEDIA_NOT_FOUND: 'Could not find any {{device}} on your device, '
    + 'please connect a {{device}}',
  MEDIA_NOT_SELECTED: 'A valid {{device}} should be selected or '
    + 'try restarting your browser/device',
  MEDIA_ALREADY_IN_USE: '{{device}} already in use by other application, '
    + 'please close all active applications and try again',
  MEDIA_SOURCE_NOT_ACTIVE: '{{device}} is not active, '
    + 'please select another {{device}} or try restarting your browser/device',
  ABORT_ERROR: '{{device}} could not be started, please try again or '
    + 'restart your browser/device',
  TIMEOUT_ERROR: '{{device}} failed to start, please try again or '
    + 'restart your browser/device',
};

const mediumDevicesMap = {
  audio: 'microphone',
  video: 'camera',
};

class MediaSourceError extends Error {
  constructor(code, type) {
    const template = messagesMap[code];
    const values = { device: mediumDevicesMap[type], type };
    super(fromTemplate(template, values));

    this._code = code;
    this._type = type;
  }

  get code() {
    return this._code;
  }

  get type() {
    return this._type;
  }
}

export default MediaSourceError;
