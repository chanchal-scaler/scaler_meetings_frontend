/* eslint-disable max-len */
import {
  isChrome,
  isFirefox,
  isIOS,
  isMobile,
  isSafari,
} from '@common/utils/platform';
import { isFunction, isNullOrUndefined } from '@common/utils/type';

export const ScreenShareQuality = {
  excellent: 'excellent',
  better: 'better',
  good: 'good',
  medium: 'medium',
  low: 'low',
};

export const screenQualityLabelsMap = {
  [ScreenShareQuality.excellent]: 'HQ Video content',
  [ScreenShareQuality.better]: 'Code editor',
  [ScreenShareQuality.good]: 'Video content',
  [ScreenShareQuality.medium]: 'Whiteboard, Docs etc.',
  [ScreenShareQuality.low]:
    'Whiteboard, Code editor optimized for low bandwidth',
};

export const screenQualityHintsMap = {
  [ScreenShareQuality.excellent]: '1080p@30fps',
  [ScreenShareQuality.better]: '1080p@5fps',
  [ScreenShareQuality.good]: '720p@30fps',
  [ScreenShareQuality.medium]: '720p@5fps',
  [ScreenShareQuality.low]: '480p@5fps',
};

// Agora specific screen share quality pricing
// Agora charges higher for 1080p screen share
export function isHighCostScreenShare(quality) {
  return (quality === ScreenShareQuality.excellent || quality === ScreenShareQuality.better);
}

export function isMediaSourceActive(source) {
  return (source && source.readyState === 'live');
}

export function isRotationSupported() {
  const { screen } = window;
  return (
    isMobile()
    && (isChrome() || isFirefox())
    && (screen && screen.orientation && isFunction(screen.orientation.lock))
  );
}

// Only chrome desktop browser has stable support to change audio device
export function isSpeakerChangeSupported() {
  return isChrome() && !isMobile();
}

export function findMatchingMediaSource(
  allSources,
  currentSource,
  newSourceDeviceId,
) {
  if (newSourceDeviceId || isNullOrUndefined(currentSource)) {
    const matchedSource = allSources.find(
      o => o.getSettings().deviceId === newSourceDeviceId,
    );

    return matchedSource || allSources[0];
  } else {
    return currentSource;
  }
}

export function isWebRTCSupportUnstable() {
  return isIOS() || isSafari();
}

export const ScreenShareErrorTypes = {
  PermissionDeniedUser: 'AgoraRTCError PERMISSION_DENIED: NotAllowedError: Permission denied',
  PermissionDeniedSystem: 'AgoraRTCError PERMISSION_DENIED: NotAllowedError: Permission denied by system',
  PermissionDeniedAgent: 'AgoraRTCError PERMISSION_DENIED: NotAllowedError: The request is not allowed by the user agent or the platform in the current context.',
  NotReadable: 'AgoraRTCError NOT_READABLE: NotReadableError: Could not start video source',
  NotSupported: 'AgoraRTCError NOT_SUPPORTED: This browser does not support screen sharing',
  Unexpected: 'AgoraRTCError UNEXPECTED_ERROR: OverconstrainedError: Source failed to restart',
  Gateway: 'AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: flag: 4096, message: AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: dynamic key expired',
  UIDConflict: 'AgoraRTCError UID_CONFLICT:',
  DeviceNotFound: 'AgoraRTCError DEVICE_NOT_FOUND: NotFoundError: The object can not be found here.',
  PermissionDeniedInvalidState: 'AgoraRTCError PERMISSION_DENIED: NotAllowedError: Invalid state',
  PermissionDeniedNoUserGesture: 'AgoraRTCError PERMISSION_DENIED: InvalidStateError: getDisplayMedia requires transient activation from a user gesture.',
  InvalidConstraints: 'AgoraRTCError UNEXPECTED_ERROR: OverconstrainedError: Cannot satisfy constraints',
};
