import { isChromium } from '@common/utils/platform';
import { NetworkQuality } from '~meetings/utils/network';
import { ScreenShareQuality } from '~meetings/utils/media';
import { VideoStreamTypes } from '~meetings/utils/stream';

export const StreamTypes = {
  av: 1,
  screen: 2,
  recording: 3,
  recordedAv: 4,
  recordedScreen: 5,
};

const preRecordedStreamTypes = [
  StreamTypes.recordedAv,
  StreamTypes.recordedScreen,
];

const StreamTypeCategories = {
  [StreamTypes.av]: VideoStreamTypes.av,
  [StreamTypes.recordedAv]: VideoStreamTypes.av,
  [StreamTypes.screen]: VideoStreamTypes.screen,
  [StreamTypes.recordedScreen]: VideoStreamTypes.screen,
};

export function parseStreamId(id) {
  const streamId = id.toString();
  const typePrefix = parseInt(streamId.substring(0, 1), 10);
  const userId = streamId.substring(1);
  const type = StreamTypeCategories[typePrefix];
  const isPreRecorded = preRecordedStreamTypes.includes(typePrefix);
  return [type, userId, isPreRecorded];
}

export const CODES_PREFERENCE = ['vp8', 'h264'];

const AGORA_ROLES = {
  super_host: 'host',
  host: 'host',
  audience: 'audience',
};

export const DEFAULT_SCREEN_MODE = 'live';

export const DEFAULT_AUDIO_PROFILE = 'music_standard';

export const SCREEN_PROFILES = {
  [ScreenShareQuality.excellent]: '1080p_2',
  [ScreenShareQuality.better]: '1080p_1',
  [ScreenShareQuality.good]: '720p_2',
  [ScreenShareQuality.medium]: '720p_1',
  [ScreenShareQuality.low]: '480p_1',
};


export function getMappedRole(role) {
  return AGORA_ROLES[role] || AGORA_ROLES.audience;
}

export function normalizeAgoraNetworkQuality(value) {
  switch (value) {
    case 1:
    case 2:
      return NetworkQuality.good;
    case 3:
    case 4:
      return NetworkQuality.average;
    case 5:
    case 6:
      return NetworkQuality.bad;
    default:
      return NetworkQuality.unknown;
  }
}

export function normalizeAgoraNetworkLatency(value) {
  if (value > 500) {
    return NetworkQuality.bad;
  } else if (value > 300) {
    return NetworkQuality.average;
  } else if (value > 0) {
    return NetworkQuality.good;
  } else {
    return NetworkQuality.unknown;
  }
}

export function networkQualityToMagnitude(quality) {
  if (quality === 0) {
    return 0;
  } else {
    return 7 - quality;
  }
}

export function getHigherResolution(res1, res2) {
  const getValue = (res) => {
    const match = res.match(/(\d+)p/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const value1 = getValue(res1);
  const value2 = getValue(res2);
  return value1 >= value2 ? res1 : res2;
}

export function configurableVideoProfiles(resolutionConfig) {
  // avScreen Resolutions must all be greater than 480p
  const avResolution = resolutionConfig?.av?.resolution ?? null;
  const avScreenResolution = resolutionConfig?.['av_screen']?.resolution
    ?? null;

  if (avResolution && avScreenResolution) {
    return {
      // Audio/Video resolution when just sharing video
      av: isChromium()
        ? avResolution
        : getHigherResolution(avResolution, '480p_1'),
      // Audio/Video resolution when screen share is active
      avScreen: isChromium()
        ? avScreenResolution
        : getHigherResolution(avScreenResolution, '480p_1'),
    };
  } else {
    // Default settings for Chromium and others
    return {
      // Audio/Video resolution when just sharing video
      av: isChromium() ? '240p_1' : '480p_1',
      // Audio/Video resolution when screen share is active
      avScreen: isChromium() ? '120p_1' : '480p_1',
    };
  }
}
