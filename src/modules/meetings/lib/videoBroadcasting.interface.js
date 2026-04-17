/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import { NotImplementedError } from '@common/errors';
import _BaseInterface from './_base.interface';

import {
  ScreenShareQuality,
} from '~meetings/utils/media';

class VideoBroadcastingInterface extends _BaseInterface {
  // Public exposed accessors

  downlinkQuality = 0;

  videoUplinkQuality = 0;

  screenUplinkQuality = 0;

  networkQualityUpdateInterval = 2000;

  // Public exposed methods

  async isDeviceSupported() {
    throw new NotImplementedError('isDeviceSupported');
  }

  async join() {
    throw new NotImplementedError('join');
  }

  async setRole(role, forceServer = false) {
    throw new NotImplementedError('setRole');
  }

  async resetRole() {
    throw new NotImplementedError('resetRole');
  }

  // Deprecated. Will be removed when agora v3 is completely deprecated
  setVideoSource(mediaStream, preferredDeviceId = null, isEnabled = true) {
    throw new NotImplementedError('setVideoSource');
  }

  // Deprecated. Will be removed when agora v3 is completely deprecated
  setAudioSource(mediaStream, preferredDeviceId = null, isEnabled = true) {
    throw new NotImplementedError('setAudioSource');
  }

  // Deprecated. Will be removed when agora v3 is completely deprecated
  setScreenSource(mediaStream) {
    throw new NotImplementedError('setScreenSource');
  }

  setScreenQuality(quality = ScreenShareQuality.medium) {
    throw new NotImplementedError('setScreenQuality');
  }

  async streamAudioAndVideo(
    audio = { enabled: true, deviceId: 'default', muted: false },
    video = { enabled: true, deviceId: 'default', muted: false },
  ) {
    throw new NotImplementedError('streamAudioAndVideo');
  }

  async unstreamAudioAndVideo() {
    throw new NotImplementedError('unstreamAudioAndVideo');
  }

  async shareScreen(quality) {
    throw new NotImplementedError('shareScreen');
  }

  async unshareScreen() {
    throw new NotImplementedError('unshareScreen');
  }

  setMute(type, isMuted) {
    throw new NotImplementedError('setMute');
  }

  async switchDevice(deviceType, deviceId) {
    throw new NotImplementedError('switchDevice');
  }

  updateToken(token) {
    throw new NotImplementedError('updateToken');
  }

  getBillingCategory(resolution) {
    throw new NotImplementedError('getBillingCategory');
  }

  async destroy() {
    throw new NotImplementedError('destroy');
  }

  // Public exposed getters

  // Override in parent class if required
  get settings() {
    return {};
  }

  get micStream() {
    throw new NotImplementedError('micStream');
  }
}

export default VideoBroadcastingInterface;
