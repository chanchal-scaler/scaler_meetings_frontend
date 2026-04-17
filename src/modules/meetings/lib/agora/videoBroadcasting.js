import camelCase from 'lodash/camelCase';
import intersection from 'lodash/intersection';

import {
  CODES_PREFERENCE, DEFAULT_AUDIO_PROFILE, DEFAULT_SCREEN_MODE, getMappedRole,
  networkQualityToMagnitude, normalizeAgoraNetworkLatency,
  normalizeAgoraNetworkQuality, parseStreamId, SCREEN_PROFILES, StreamTypes,
  configurableVideoProfiles,
} from './utils';
import {
  DEFAULT_CODEC_OPTIONS,
  MEETING_RESOLUTION_CATEGORY,
} from '~meetings/utils/constants';
import {
  findMatchingMediaSource,
  ScreenShareQuality,
} from '~meetings/utils/media';
import {
  isChrome, isEdge, isFirefox, isMobile, isSafari,
} from '@common/utils/platform';
import { isDevelopment, log } from '@common/utils/debug';
import { isNullOrUndefined } from '@common/utils/type';
import { lazyModule } from '@common/utils/lazy';
import { logEvent } from '@common/utils/logger';
import { MediaCodecError, MediaSourceError } from '~meetings/errors';
import { VideoConnectionStates } from '~meetings/utils/videoConnection';
import AgoraStream from './stream';
import VideoBroadcastingInterface
  from '~meetings/lib/videoBroadcasting.interface';
import VIDEO_BROADCASTING_EVENTS from '~meetings/lib/videoBroadcasting.events';

const CLOUD_PROXY_MODE = 4;

if (isFirefox()) {
  window.mozRTCPeerConnection = window.RTCPeerConnection;
  window.mozRTCSessionDescription = window.RTCSessionDescription;
  window.mozRTCIceCandidate = window.RTCIceCandidate;
}

function fetchRTCSdk() {
  return lazyModule(() => import('agora-rtc-sdk'));
}

/* Promise based versions for some agora methods */

/**
 * Promise based version of `AgoraRTC.Client.setClientRole` function
 */
function setClientRole(client, role) {
  return new Promise((resolve, reject) => {
    client.setClientRole(role, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Promise based version of `AgoraRTC.Client.join` function
 */
function joinChannel(client, token, channel, uid, options = {}) {
  return new Promise((resolve, reject) => {
    const { useProxy = false } = options;
    if (useProxy) {
      client.startProxyServer(CLOUD_PROXY_MODE);
    }

    client.join(token, channel, uid, () => {
      resolve();
    }, (error) => {
      reject(error);
    });
  });
}

/**
 * Promise based version of `AgoraRTC.Client.leave` function
 */
function leaveChannel(client, options = {}) {
  return new Promise((resolve, reject) => {
    const { useProxy = false } = options;

    client.leave(
      () => {
        if (useProxy) client.stopProxyServer();

        resolve();
      },
      error => {
        if (useProxy) client.stopProxyServer();

        reject(error);
      },
    );
  });
}

/**
 * Promise based version of `AgoraRTC.Client.publish` function
 */
function publishStream(client, stream) {
  return new Promise((resolve, reject) => {
    const onPublishSuccess = (event) => {
      client.off('stream-published', onPublishSuccess);
      resolve(event);
    };

    client.on('stream-published', onPublishSuccess);

    client.publish(stream, (error) => {
      client.off('stream-published', onPublishSuccess);
      reject(error);
    });
  });
}

/**
 * Promise based version of `AgoraRTC.Client.unpublish` function
 */
function unpublishStream(client, stream) {
  return new Promise((resolve, reject) => {
    if (stream) {
      const onUnpublishSuccess = (event) => {
        client.off('stream-unpublished', onUnpublishSuccess);
        resolve(event);
      };

      client.on('stream-unpublished', onUnpublishSuccess);

      client.unpublish(stream, (error) => {
        client.off('stream-unpublished', onUnpublishSuccess);
        // Do not reject here, this is the case where screen share is cancelled
        // from the popup window
        if (['STREAM_NOT_YET_PUBLISHED'].includes(error)) {
          resolve();
        }
        reject(error);
      });
    } else {
      resolve();
    }
  });
}

const stopCameraTimeout = 2000;

/**
 * Stoping camera i.e making the light that comes beside camera on most of the
 * devices go away is supported only on Chrome, Edge, Firefox and Safari
 * browsers on Desktop. Some mobile browsers don't support this and there is
 * no definite way to know which support and which don't so we have disabled
 * this for all mobile devices.
 */
const stopCameraOnMute = !isMobile() && (
  isChrome()
  || isEdge()
  || isFirefox()
  || isSafari()
);

const clientEvents = [
  'connected', 'error', 'stream-added', 'stream-removed', 'mute-audio',
  'unmute-audio', 'mute-video', 'unmute-video', 'volume-indicator',
  'peer-leave', 'reconnect', 'network-quality', 'stream-fallback',
  'stream-type-changed',
];

const screenClientEvents = ['network-quality'];

/**
 * Order of calling methods
 *
 * 1. Create a `VideoBroadcasting` instance.
 * 2. Call `initialise` method.
 * 3. Call `join` method.
 * 4. Call `setVideoSource` and `setAudioSource` if user needs to send streams.
 * 5. Call `streamAudioAndVideo` when the required soruces have been
 *    successfully set.
 */
class VideoBroadcasting extends VideoBroadcastingInterface {
  // Below three properties are used to internally manage stopping and start
  // camera when user mutes his camera. In coming future this will be a part of
  // Agora SDK itself
  _lastUsedCameraId = 'default';

  _isCameraStopped = false;

  _stopCameraTimer = null;

  _latency = 0;

  _latencyListener = null;

  _latencyUpdateInterval = 3000;

  isLegacy = true;

  downlinkQuality = 0;

  videoUplinkQuality = 0;

  screenUplinkQuality = 0;

  networkQualityUpdateInterval = 2000;

  /* Public methods/properties */
  constructor(config, channelName, userId, token, options, role) {
    super(config, channelName, userId, token, options);

    this._setInitialRole(role);
    this._setBaseProperties();
  }

  async destroy() {
    this._removeEventListeners();
    if (this._latencyListener) {
      clearInterval(this._latencyListener);
    }
    await this._leave();
  }

  // eslint-disable-next-line
  getBillingCategory(resolution) {
    if (resolution <= MEETING_RESOLUTION_CATEGORY.hd) {
      return 'HD Streaming (Pocket-Friendly)';
    } else if (resolution <= MEETING_RESOLUTION_CATEGORY.fhd) {
      return 'FHD Streaming (Still Affordable)';
    } else if (resolution <= MEETING_RESOLUTION_CATEGORY.twoK) {
      return '2K Streaming (Wallet is sweating...)';
    } else {
      return '2k+ Streaming (Scaler CEO is calling...)';
    }
  }

  /**
   * Returns `boolean` indicating if device satifies all requirements for
   * broadcasting videos.
   *
   * Making this async incase if future if we need to perform any async
   * operations here like getting device hardware/drivers information etc.
   */
  // eslint-disable-next-line
  async isDeviceSupported() {
    const AgoraRTC = await fetchRTCSdk();
    return AgoraRTC.checkSystemRequirements();
  }

  async initialise() {
    const AgoraRTC = await fetchRTCSdk();
    await this._loadSupportedCodec();
    if (this._codec !== CODES_PREFERENCE[0]) {
      throw new MediaCodecError(this._codec);
    }
    AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.ERROR);
    if (!isDevelopment()) {
      AgoraRTC.Logger.enableLogUpload();
    }
    this._client = await this._createClient();
    await this.setRole(this._normalizedRole, true);

    // Enable this to receive audio volume level indicator which will be used
    // to highlight active speaker
    this.client.enableAudioVolumeIndicator();
  }

  async join() {
    await joinChannel(
      this.client,
      this._avToken,
      this.channelName,
      this._avUserId,
      { useProxy: this._shouldUseProxy },
    );
    this._initLatencyListener();
    this._addEventListeners();
  }

  async resetRole() {
    await this.setRole(this._normalizedRole);
  }

  async setRole(role, forceServer = false) {
    const mappedRole = getMappedRole(role);
    if (forceServer) {
      await this._setClientRole(mappedRole);
    }
    this._role = mappedRole;
  }

  setScreenQuality(quality = ScreenShareQuality.medium) {
    if (this._screenStream) {
      const defaultProfile = SCREEN_PROFILES[ScreenShareQuality.medium];
      const screenProfile = SCREEN_PROFILES[quality] || defaultProfile;
      this._screenStream.setScreenProfile(screenProfile);
      const attrs = this._screenAttributes && this._screenAttributes[quality];
      if (attrs) {
        this._screenStream.screenAttributes.minVideoBW = attrs.minBW;
        this._screenStream.screenAttributes.maxVideoBW = attrs.maxBW;
      }
    }
  }

  async shareScreen(quality) {
    if (this._role !== 'host') {
      throw new Error('Only host can share screen');
    }

    try {
      /**
       * Create this only if client does not already exist. Possible case where
       * the client can already exist is when this function fails after client
       * is created
       */
      if (isNullOrUndefined(this._screenClient)) {
        this._screenClient = await this._createClient(this._screenMode);
      }

      if (this._screenMode !== 'rtc') {
        await setClientRole(this._screenClient, this._role);
      }

      try {
        await joinChannel(
          this._screenClient,
          this._screenToken,
          this.channelName,
          this._screenUserId,
          { useProxy: this._shouldUseProxy },
        );
        this._addScreenEventListeners();
      } catch (error) {
        /**
         * If client already joined the channel ignore the error and proceed to
         * sharing screen. Possible case is where this function was called
         * before and it failed after joining the channel
         */
        if (!['INVALID_OPERATION', 'ERR_REPEAT_JOIN'].includes(error)) {
          throw error;
        }
      }

      const AgoraRTC = await fetchRTCSdk();
      this._screenStream = AgoraRTC.createStream({
        audio: false,
        video: false,
        screen: true,
      });

      // Update stream profiles so that we don't fall in Agora HD+ category
      // which charges 50% more than the HD streaming
      this._avStream.setVideoProfile(this._resolutionConfig?.avScreen);
      this.setScreenQuality(quality);

      await this._initialiseStream(this._screenStream);

      await publishStream(this._screenClient, this._screenStream);

      // Stop screen share stream when user ends screen sharing via the
      // native (browser rendered) "Stop sharing" button
      this._screenStream.on(
        'stopScreenSharing',
        this._handleScreenShareStopped,
      );

      this._emitLocalStreamAdded(this._screenStream);
    } catch (error) {
      // Revert back to normal video profile if screen share fails
      this._avStream.setVideoProfile(this._resolutionConfig?.av);
      // To handle some rare race condition where stream is published but
      // on the client error is raised (Reason unknown)
      this.unshareScreen();
      throw error;
    }
  }

  async unshareScreen() {
    if (isNullOrUndefined(this._screenStream)) {
      return;
    }

    this._removeScreenEventListeners();
    await unpublishStream(this._screenClient, this._screenStream);
    this._screenStream.close();
    this._emitLocalStreamRemoved(this._screenStream);
    await leaveChannel(this._screenClient, { useProxy: this._shouldUseProxy });

    // Revert back to normal video profile after screen sharing ends
    if (this._avStream) {
      this._avStream.setVideoProfile(this._resolutionConfig?.av);
    }

    this._screenStream = null;
    this._sources.screen = null;
    this._screenClient = null;
    this.screenUplinkQuality = 0;
  }

  setVideoSource(mediaStream, preferredDeviceId = null, isEnabled = true) {
    const videoSources = mediaStream.getVideoTracks();
    this._setMediaSource('video', videoSources, preferredDeviceId, isEnabled);
  }

  setAudioSource(mediaStream, preferredDeviceId = null, isEnabled = true) {
    const audioSources = mediaStream.getAudioTracks();
    this._setMediaSource('audio', audioSources, preferredDeviceId, isEnabled);
  }

  setScreenSource(mediaStream) {
    const screenSources = mediaStream.getVideoTracks();
    this._setMediaSource('screen', screenSources);
  }

  setMute(type, isMuted) {
    if (type !== 'screen' && !this._avStream) {
      return;
    }

    if (type === 'screen' && !this._screenStream) {
      return;
    }

    const streamId = type === 'screen'
      ? this._screenStream.getId()
      : this._avStream.getId();
    switch (type) {
      case 'audio':
        if (isMuted) {
          this._avStream.muteAudio();
          this.emit(VIDEO_BROADCASTING_EVENTS.muteAudio, { id: streamId });
        } else {
          this._avStream.unmuteAudio();
          this.emit(VIDEO_BROADCASTING_EVENTS.unmuteAudio, { id: streamId });
        }
        break;
      case 'video':
        if (isMuted) {
          this._avStream.muteVideo();
          this._stopCamera();
          this.emit(VIDEO_BROADCASTING_EVENTS.muteVideo, { id: streamId });
        } else {
          this._startCamera();
          this._avStream.unmuteVideo();
          this.emit(VIDEO_BROADCASTING_EVENTS.unmuteVideo, { id: streamId });
        }
        break;
      case 'screen':
        if (isMuted) {
          this._screenStream.muteVideo();
          this.emit(VIDEO_BROADCASTING_EVENTS.muteVideo, { id: streamId });
        } else {
          this._screenStream.unmuteVideo();
          this.emit(VIDEO_BROADCASTING_EVENTS.unmuteVideo, { id: streamId });
        }
        break;
      default:
        throw new Error('Can\'t mute - Source type unidentified');
    }
  }

  /**
   * Make sure all the required sources(audio and video) have been successfully
   * set before calling this method
   */
  async streamAudioAndVideo(audio = true, video = false) {
    if (audio) {
      this._throwErrorIfSourceNotAvailable('audio');
    }

    if (video) {
      this._throwErrorIfSourceNotAvailable('video');
    }

    try {
      await this._enableDualStream();
    } catch (error) {
      logEvent(
        'info',
        'VideoBroadcastingInfo: Failed to enable dual stream',
        error,
      );
    }

    const AgoraRTC = await fetchRTCSdk();
    this._avStream = AgoraRTC.createStream({
      audio,
      video,
      audioSource: audio && this._sources.audio,
      videoSource: video && this._sources.video,
      facingMode: 'user',
    });

    this._avStream.setAudioProfile(this._audioProfile);
    await this._initialiseStream(this._avStream);

    this._avStream.setVideoProfile(this._resolutionConfig?.av);
    await this._publishStream(this._avStream);

    this._emitLocalStreamAdded(this._avStream);
    this._stopCameraIfMuted();
  }

  async unstreamAudioAndVideo() {
    try {
      await this._disableDualStream();
    } catch (error) {
      logEvent(
        'info',
        'VideoBroadcastingInfo: Failed to disable dual stream',
        error,
      );
    }

    await this._unpublishStream(this._avStream);
    this._emitLocalStreamRemoved(this._avStream);
    clearTimeout(this._stopCameraTimer);
    this._isCameraStopped = false;
    this._lastUsedCameraId = 'default';
    this._sources.audio = null;
    this._sources.video = null;
    this._avStream = null;
  }

  updateToken(token) {
    if (isNullOrUndefined(token)) {
      return;
    }

    this._token = token;
    if (this.client) {
      this.client.renewToken(this._avToken);
    }
  }

  async switchDevice(deviceType, deviceId) {
    if (this._avStream && isChrome()) {
      // If video on mute just change the camera device id
      if (deviceType === 'video' && this._isCameraStopped) {
        this._lastUsedCameraId = deviceId;
      } else {
        const constraints = { deviceId: { exact: deviceId } };
        const stream = await navigator.mediaDevices
          .getUserMedia({ [deviceType]: constraints });

        this._avStream.replaceTrack(
          stream.getTracks()[0],
          null,
          // On failure release the new media devices
          () => stream.getTracks().forEach(track => track.stop()),
        );
      }
    }
  }

  get micStream() {
    return this._avStream?.stream;
  }

  // eslint-disable-next-line
  get settings() {
    return window.__MEETING_CONFIG__
      ?.settings
      ?.agora
      ?.video_broadcasting || {};
  }

  /* Event handlers(Using arrow functions so that context is not lost) */

  _handleConnected = () => {
    this.emit(
      VIDEO_BROADCASTING_EVENTS.connectionStateChange,
      VideoConnectionStates.connected,
    );
  }

  _handleError = (error) => {
    let state = VideoConnectionStates.failed;
    if (error.reason) {
      state = VideoConnectionStates.reconnecting;
    }
    this.emit(VIDEO_BROADCASTING_EVENTS.connectionStateChange, state);
  }

  _handleReconnect = () => {
    this.emit(
      VIDEO_BROADCASTING_EVENTS.connectionStateChange,
      VideoConnectionStates.reconnecting,
    );
  }

  _handleStreamAdded = (event) => {
    const { stream } = event;
    const streamId = stream.getId();

    // Ignore streams that are created by the same user. Rather use local
    // streams to avoid additional charges
    if (this._isMyStream(streamId)) {
      return;
    }

    this._remoteStreams[streamId] = stream;
    const genericStream = new AgoraStream(this, stream, true);
    this.emit(VIDEO_BROADCASTING_EVENTS.streamAdded, { stream: genericStream });
  }

  _handleStreamRemoved = (event) => {
    const { stream } = event;
    const streamId = stream.getId();
    // Ignore streams that are created by the same user.
    if (this._isMyStream(streamId)) {
      return;
    }

    this.emit(VIDEO_BROADCASTING_EVENTS.streamRemoved, { id: streamId });
  }

  _handleMuteAudio = (event) => {
    const { uid } = event;
    this.emit(VIDEO_BROADCASTING_EVENTS.muteAudio, { id: uid });
  }

  _handleMuteVideo = (event) => {
    const { uid } = event;
    this.emit(VIDEO_BROADCASTING_EVENTS.muteVideo, { id: uid });
  }

  _handleUnmuteAudio = (event) => {
    const { uid } = event;
    this.emit(VIDEO_BROADCASTING_EVENTS.unmuteAudio, { id: uid });
  }

  _handleUnmuteVideo = (event) => {
    const { uid } = event;
    this.emit(VIDEO_BROADCASTING_EVENTS.unmuteVideo, { id: uid });
  }

  _handleVolumeIndicator = (event) => {
    const { attr } = event;
    const volumes = attr.reduce((v, volume) => {
      // eslint-disable-next-line
      v[volume.uid] = volume.level;
      return v;
    }, {});
    this.emit(VIDEO_BROADCASTING_EVENTS.volumeIndicator, { volumes });
  }

  _handlePeerLeave = (event) => {
    const streamId = event.uid;
    // Ignore streams that are created by the same user.
    if (this._isMyStream(streamId)) {
      return;
    }

    this.emit(VIDEO_BROADCASTING_EVENTS.streamRemoved, { id: streamId });
  }

  _handleScreenShareStopped = () => {
    this.emit(VIDEO_BROADCASTING_EVENTS.screenShareStopped);
  }

  _handleNetworkQuality = (stats) => {
    this.downlinkQuality = stats.downlinkNetworkQuality;
    this.videoUplinkQuality = stats.uplinkNetworkQuality;
    this._emitNetworkQualityUpdate();
  }

  _handleStreamFallback = (event) => {
    this.emit(
      VIDEO_BROADCASTING_EVENTS.streamFallback,
      { id: event.uid, isFallback: event.attr === 1 },
    );
  }

  _handleStreamTypeChanged = (event) => {
    this.emit(
      VIDEO_BROADCASTING_EVENTS.streamFallback,
      { id: event.uid, isFallback: false },
    );
  }

  _handleScreenNetworkQuality = (stats) => {
    this.screenUplinkQuality = stats.uplinkNetworkQuality;
    this._emitNetworkQualityUpdate();
  }

  /* Private methods/properties */

  _addEventListeners() {
    clientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this.client.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _addScreenEventListeners() {
    if (!this._screenClient) {
      return;
    }

    this._removeScreenEventListeners();
    screenClientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-screen-${eventName}`);
      this._screenClient.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _createClient(mode) {
    return new Promise((resolve, reject) => {
      fetchRTCSdk()
        .then((AgoraRTC) => {
          const client = AgoraRTC.createClient({
            mode: mode || this._mode,
            codec: this._codec,
          });
          client.init(this._appId, () => {
            resolve(client);
          }, (error) => {
            reject(error);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  _disableDualStream() {
    return new Promise((resolve, reject) => {
      if (this._shouldEnableDualStream) {
        this._client.disableDualStream(resolve, reject);
      } else {
        resolve();
      }
    });
  }

  _emitLocalStreamAdded(stream) {
    const genericStream = new AgoraStream(this, stream, false);
    this.emit(VIDEO_BROADCASTING_EVENTS.streamAdded, { stream: genericStream });
  }

  _emitLocalStreamRemoved(stream) {
    const streamId = stream.getId();
    this.emit(VIDEO_BROADCASTING_EVENTS.streamRemoved, { id: streamId });
  }

  _emitNetworkQualityUpdate() {
    const downlink = normalizeAgoraNetworkQuality(this.downlinkQuality);
    const uplink = normalizeAgoraNetworkQuality(this._uplinkQuality);
    const networkQuality = normalizeAgoraNetworkLatency(this._latency);
    this.emit(VIDEO_BROADCASTING_EVENTS.networkQuality, {
      downlink,
      uplink,
      networkQuality,
      extra: {
        videoUplink: networkQualityToMagnitude(this.videoUplinkQuality),
        screenUplink: networkQualityToMagnitude(this.screenUplinkQuality),
        downlink: networkQualityToMagnitude(this.downlinkQuality),
        networkQuality: this._latency,
      },
    });
  }

  _enableDualStream() {
    return new Promise((resolve, reject) => {
      if (this._shouldEnableDualStream) {
        if (this._lowStreamParams) {
          this._client.setLowStreamParameter(this._lowStreamParams);
        }
        this._client.enableDualStream(resolve, reject);
      } else {
        resolve();
      }
    });
  }

  _initLatencyListener() {
    this._latencyListener = setInterval(() => {
      this.client.getTransportStats((stats) => {
        this._latency = parseInt(stats.RTT, 10);
        this._emitNetworkQualityUpdate();
      });
    }, this._latencyUpdateInterval);
  }

  _stopCameraIfMuted() {
    const videoTrack = this._avStream.getVideoTrack();
    const muted = !(videoTrack && videoTrack.enabled);
    if (muted) {
      this._stopCamera();
    }
  }

  _throwErrorIfSourceNotAvailable(type) {
    if (isNullOrUndefined(this._sources[type])) {
      throw new MediaSourceError('MEDIA_NOT_SELECTED', type);
    }
  }

  async _loadSupportedCodec() {
    const AgoraRTC = await fetchRTCSdk();
    const allCodecs = await AgoraRTC.getSupportedCodec();
    // Chrome versions >= 103 returns an empty array for audio/video codecs
    // adding a check to avoid this
    if (allCodecs.video.length === 0) {
      allCodecs.video.push(DEFAULT_CODEC_OPTIONS.video);
    }
    if (allCodecs.audio.length === 0) {
      allCodecs.audio.push(DEFAULT_CODEC_OPTIONS.audio);
    }
    const availableCodecs = allCodecs.video.map(o => o.toLowerCase());
    this._supportedCodecs = intersection(CODES_PREFERENCE, availableCodecs);
    log(`Using ${this._supportedCodecs[0]} codec for video streaming`);
    [this._codec] = this._supportedCodecs;
  }

  // eslint-disable-next-line
  _initialiseStream(stream) {
    return new Promise((resolve, reject) => {
      stream.init(() => {
        resolve();
      }, (error) => {
        reject(error);
      });
    });
  }

  _isMyStream(streamId) {
    const [, userId] = parseStreamId(streamId);
    return this.userId === userId;
  }

  async _leave() {
    await leaveChannel(this.client, { useProxy: this._shouldUseProxy });
  }

  async _publishStream(stream) {
    await publishStream(this.client, stream);
  }

  _removeEventListeners() {
    if (!this.client) {
      return;
    }

    clientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this.client.off(eventName, this[`_${handlerFnName}`]);
    });
  }

  _removeScreenEventListeners() {
    if (!this._screenClient) {
      return;
    }

    screenClientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-screen-${eventName}`);
      this._screenClient.off(eventName, this[`_${handlerFnName}`]);
    });
  }

  async _setClientRole(role) {
    await setClientRole(this.client, role);
  }

  _setMediaSource(type, sources, preferredDeviceId, isEnabled = true) {
    const newSource = findMatchingMediaSource(
      sources,
      this._sources[type],
      preferredDeviceId,
    );

    if (newSource) {
      newSource.enabled = isEnabled;
      this._sources[type] = newSource;
    } else {
      throw new MediaSourceError('MEDIA_NOT_FOUND', type);
    }
  }

  _setInitialRole(role) {
    this._normalizedRole = role;
  }

  _setBaseProperties() {
    this._sources = {};
    this._remoteStreams = {};
  }

  async _startCamera() {
    if (!stopCameraOnMute) {
      return;
    }

    clearTimeout(this._cameraReleaseTimer);
    if (this._isCameraStopped && this._avStream) {
      const mediaStream = await navigator.mediaDevices
        .getUserMedia({
          video: { deviceId: { ideal: this._lastUsedCameraId } },
        });
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        this._avStream.replaceTrack(track, () => {
          let profile = this._resolutionConfig?.av;
          if (this._screenStream) {
            profile = this._resolutionConfig?.avScreen;
          }
          this._avStream.setVideoProfile(profile);
        });
      }
      this._isCameraStopped = false;
    }
  }

  _stopCamera() {
    if (!stopCameraOnMute) {
      return;
    }

    clearTimeout(this._cameraReleaseTimer);
    this._cameraReleaseTimer = setTimeout(() => {
      const track = this._avStream.getVideoTrack();
      if (track) {
        this._lastUsedCameraId = track.getSettings().deviceId;
        track.stop();
      }
      this._isCameraStopped = true;
    }, stopCameraTimeout);
  }

  async _unpublishStream(stream) {
    await unpublishStream(this.client, stream);
  }

  get _appId() {
    return this.config.appId;
  }

  get _audioProfile() {
    return this.settings.audio_profile || DEFAULT_AUDIO_PROFILE;
  }

  get _avToken() {
    const [token] = this._token.split('__');
    return token;
  }

  /**
   * All video stream ids start with '1' followed by user id.
   * It is important to use Integer as uid rather than string else cloud
   * recording faces issues
   */
  get _avUserId() {
    return parseInt(`${StreamTypes.av}${this.userId}`, 10);
  }

  get _lowStreamParams() {
    return this.settings.low_stream_params;
  }

  get _mode() {
    return this.options.mode || 'live';
  }

  get _screenAttributes() {
    return this.settings.screen_attributes;
  }

  get _screenMode() {
    return this.settings.screen_mode || DEFAULT_SCREEN_MODE;
  }

  get _screenToken() {
    const [, token] = this._token.split('__');
    return token;
  }

  /**
   * All screen stream ids start with '2' followed by user id.
   * It is important to use Integer as uid rather than string else cloud
   * recording faces issues
   */
  get _screenUserId() {
    return parseInt(`${StreamTypes.screen}${this.userId}`, 10);
  }

  get _shouldEnableDualStream() {
    return Boolean(this.settings.dual_stream_enabled);
  }

  get _shouldUseProxy() {
    return this.options.useProxy;
  }

  get _uplinkQuality() {
    if (this._screenClient && this.screenUplinkQuality !== 0) {
      return Math.max(this.videoUplinkQuality, this.screenUplinkQuality);
    } else {
      return this.videoUplinkQuality;
    }
  }

  get _resolutionConfig() {
    return configurableVideoProfiles(this.options.resolutionConfig) || {};
  }
}

export default VideoBroadcasting;
