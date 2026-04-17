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
import { isDevelopment, log } from '@common/utils/debug';
import { isNullOrUndefined } from '@common/utils/type';
import { lazyModule } from '@common/utils/lazy';
import { MediaCodecError, MediaSourceError } from '~meetings/errors';
import { ScreenShareQuality } from '~meetings/utils/media';
import { VideoConnectionStates } from '~meetings/utils/videoConnection';
import AgoraStream from './streamV4';
import LocalStreamUser from './localUser';
import VideoBroadcastingInterface
  from '~meetings/lib/videoBroadcasting.interface';
import VIDEO_BROADCASTING_EVENTS from '../videoBroadcasting.events';

function fetchRTCSdk() {
  return lazyModule(() => import('agora-rtc-sdk-ng'));
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
  none: 4,
};

const CLIENT_EVENTS = [
  'connection-state-change', 'user-joined', 'user-left', 'user-published',
  'user-unpublished', 'volume-indicator', 'network-quality', 'stream-fallback',
  'stream-type-changed', 'is-using-cloud-proxy',
];

const SCREEN_CLIENT_EVENTS = ['network-quality'];

const AGORA_CONNECTION_STATES = {
  disconnected: 'DISCONNECTED',
  connecting: 'CONNECTING',
  connected: 'CONNECTED',
  reconnecting: 'RECONNECTING',
  disconnecting: 'DISCONNECTING',
};

const AGORA_LATENCY_LEVELS = {
  standard: 1,
  premium: 2,
};

class VideoBroadcasting extends VideoBroadcastingInterface {
  // Public properties

  downlinkQuality = 0;

  videoUplinkQuality = 0;

  screenUplinkQuality = 0;

  networkQualityUpdateInterval = 2000;

  // Private properties

  _latency = 0;

  _latencyListener = null;

  _latencyUpdateInterval = 3000;

  _cameraTrack = null;

  _microphoneTrack = null;

  _cameraEncoderProfile = this._resolutionConfig?.av;

  // Public exposed methods

  constructor(config, channelName, userId, token, options, role) {
    super(config, channelName, userId, token, options);

    this._setInitialRole(role);
    this._setBaseProperties();
  }

  // eslint-disable-next-line class-methods-use-this
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
    AgoraRTC.setLogLevel(LOG_LEVELS.debug);
    if (!isDevelopment()) {
      AgoraRTC.enableLogUpload();
    }
    const mappedRole = getMappedRole(this._normalizedRole);
    this._client = await AgoraRTC.createClient({
      mode: this._mode,
      codec: this._codec,
      role: mappedRole,
      clientRoleOptions: this._getRoleOptions(mappedRole),
    });
    this._role = mappedRole;

    // Enable this to receive audio volume level indicator which will be used
    // to highlight active speaker
    this._client.enableAudioVolumeIndicator();
  }

  // TODO
  async join() {
    await this._client.join(
      this._appId, this.channelName, this._avToken, this._avUserId,
    );
    this._initLatencyListener();
    this._addEventListeners();
  }

  async setRole(role, forceServer = false) {
    const mappedRole = getMappedRole(role);
    this._role = mappedRole;
    if (forceServer) {
      await this._updateRoleOnServer();
    }
  }

  async resetRole() {
    await this.setRole(this._normalizedRole);
  }

  async streamAudioAndVideo(
    audio = { enabled: true, deviceId: 'default', muted: false },
    video = { enabled: true, deviceId: 'default', muted: false },
  ) {
    // Audio is a must for streaming
    if (!audio.enabled) {
      throw new MediaSourceError('MEDIA_NOT_SELECTED', 'audio');
    }

    const AgoraRTC = await fetchRTCSdk();

    // Set user as host
    await this._updateRoleOnServer();

    if (audio.enabled) {
      this._microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack({
        microphoneId: audio.deviceId || 'default',
        encoderConfig: this._audioProfile,
      });
    }

    if (video.enabled) {
      this._cameraTrack = await AgoraRTC.createCameraVideoTrack({
        cameraId: video.deviceId || 'default',
        encoderConfig: this._resolutionConfig?.av,
        facingMode: 'user',
        optimizationMode: 'motion',
      });
    }

    await this._client.publish(
      [this._microphoneTrack, this._cameraTrack].filter(Boolean),
    );

    if (this._microphoneTrack && audio.muted) {
      this._microphoneTrack.setEnabled(false);
    }

    if (this._cameraTrack && video.muted) {
      this._setCameraEnabled(false);
    }

    const localStreamUser = new LocalStreamUser({
      uid: this._avUserId,
      audioTrack: this._microphoneTrack,
      videoTrack: this._cameraTrack,
      audioMuted: audio.muted,
      videoMuted: video.muted,
    });
    this._localAvStreamUser = localStreamUser;
    const genericStream = new AgoraStream(this, this._localAvStreamUser, false);
    this.emit(VIDEO_BROADCASTING_EVENTS.streamAdded, { stream: genericStream });
  }

  async unstreamAudioAndVideo() {
    await this._client.unpublish();

    this.emit(
      VIDEO_BROADCASTING_EVENTS.streamRemoved,
      { id: this._localAvStreamUser.uid },
    );

    // Set user as audience on server
    this._updateRoleOnServer();
    this._localAvStreamUser = null;
    this._microphoneTrack = null;
    this._cameraTrack = null;
  }

  setScreenQuality(quality = ScreenShareQuality.medium) {
    if (this._screenTrack) {
      const defaultProfile = SCREEN_PROFILES[ScreenShareQuality.medium];
      const screenProfile = SCREEN_PROFILES[quality] || defaultProfile;
      this._screenTrack.setEncoderConfiguration(screenProfile);
    }
  }

  async shareScreen(quality = ScreenShareQuality.medium) {
    if (this._role !== 'host') {
      throw new Error('Only host can share screen');
    }

    try {
      const AgoraRTC = await fetchRTCSdk();

      /**
       * Create this only if client does not already exist. Possible case where
       * the client can already exist is when this function fails after client
       * is created
       */
      if (isNullOrUndefined(this._screenClient)) {
        this._screenClient = await AgoraRTC.createClient({
          mode: this._screenMode,
          codec: this._codec,
          role: 'host',
        });
      }

      try {
        await this._screenClient.join(
          this._appId, this.channelName, this._screenToken, this._screenUserId,
        );
        this._addScreenEventListeners();
      } catch (error) {
        /**
         * If client already joined the channel ignore the error and proceed to
         * sharing screen. Possible case is where this function was called
         * before and it failed after joining the channel
         */
        if (!['INVALID_OPERATION', 'ERR_REPEAT_JOIN'].includes(error?.code)) {
          throw error;
        }
      }

      const defaultProfile = SCREEN_PROFILES[ScreenShareQuality.medium];
      const screenProfile = SCREEN_PROFILES[quality] || defaultProfile;
      this._screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: screenProfile,
      });
      // Update stream profiles so that we don't fall in Agora HD+ category
      // which charges 50% more than the HD streaming
      await this._setCameraEncoderProfile(this._resolutionConfig?.avScreen);

      await this._screenClient.publish(this._screenTrack);
      this._screenTrack.on(
        'track-ended',
        this._handleScreenShareStopped,
      );

      const localStreamUser = new LocalStreamUser({
        uid: this._screenUserId,
        audioTrack: null,
        videoTrack: this._screenTrack,
      });
      this._localScreenStreamUser = localStreamUser;
      const genericStream = new AgoraStream(
        this,
        this._localScreenStreamUser,
        false,
      );
      this.emit(
        VIDEO_BROADCASTING_EVENTS.streamAdded,
        { stream: genericStream },
      );
    } catch (error) {
      // To handle some rare race condition where stream is published but
      // on the client error is raised (Reason unknown)
      this.unshareScreen();
      throw error;
    }
  }

  async unshareScreen() {
    if (!this._screenClient) return;

    if (this._screenTrack) {
      try {
        await this._screenClient.unpublish();
      } catch (error) {
        // Ignore error
      }

      this._screenTrack.close();
    }

    this._removeScreenEventListeners();
    try {
      await this._screenClient.leave();
    } catch (error) {
      // Ignore error
    }
    this.emit(
      VIDEO_BROADCASTING_EVENTS.streamRemoved,
      { id: this._screenUserId },
    );

    // Revert back to normal video profile after screen sharing ends
    this._setCameraEncoderProfile(this._resolutionConfig?.av);

    this._localScreenStreamUser = null;
    this._screenTrack = null;
    this._screenClient = null;
    this.screenUplinkQuality = 0;
  }

  setMute(type, isMuted) {
    if (type === 'video' && this._cameraTrack && this._localAvStreamUser) {
      const streamId = this._localAvStreamUser.uid;
      this._setCameraEnabled(!isMuted);
      if (isMuted) {
        this.emit(VIDEO_BROADCASTING_EVENTS.muteVideo, { id: streamId });
      } else {
        this.emit(VIDEO_BROADCASTING_EVENTS.unmuteVideo, { id: streamId });
      }
    }

    if (type === 'audio' && this._microphoneTrack && this._localAvStreamUser) {
      const streamId = this._localAvStreamUser.uid;
      this._microphoneTrack.setEnabled(!isMuted);
      if (isMuted) {
        this.emit(VIDEO_BROADCASTING_EVENTS.muteAudio, { id: streamId });
      } else {
        this.emit(VIDEO_BROADCASTING_EVENTS.unmuteAudio, { id: streamId });
      }
    }

    if (type === 'screen' && this._screenTrack && this._localScreenStreamUser) {
      const streamId = this._localScreenStreamUser.uid;
      this._screenTrack.setEnabled(!isMuted);
      if (isMuted) {
        this.emit(VIDEO_BROADCASTING_EVENTS.muteVideo, { id: streamId });
      } else {
        this.emit(VIDEO_BROADCASTING_EVENTS.unmuteVideo, { id: streamId });
      }
    }
  }

  async switchDevice(deviceType, deviceId) {
    if (deviceType === 'video' && this._cameraTrack) {
      this._cameraTrack.setDevice(deviceId);
    }

    if (deviceType === 'audio' && this._microphoneTrack) {
      this._microphoneTrack.setDevice(deviceId);
    }
  }

  updateToken(token) {
    if (isNullOrUndefined(token)) {
      return;
    }

    this._token = token;
    if (this._client) {
      this._client.renewToken(this._avToken);
    }
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

  async destroy() {
    this._removeEventListeners();
    if (this._latencyListener) {
      clearInterval(this._latencyListener);
    }
    await this._client.leave();
  }

  // Public exposed getters

  // eslint-disable-next-line class-methods-use-this
  get micStream() {
    if (!this._microphoneTrack) return null;

    const track = this._microphoneTrack.getMediaStreamTrack();

    if (!track) return null;

    return new MediaStream([track]);
  }

  // eslint-disable-next-line
  get settings() {
    return window.__MEETING_CONFIG__
      ?.settings
      ?.agora
      ?.video_broadcasting || {};
  }

  // Private methods

  _addEventListeners() {
    CLIENT_EVENTS.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this._client.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _addScreenEventListeners() {
    if (!this._screenClient) {
      return;
    }

    this._removeScreenEventListeners();
    SCREEN_CLIENT_EVENTS.forEach(eventName => {
      const handlerFnName = camelCase(`handle-screen-${eventName}`);
      this._screenClient.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _removeEventListeners() {
    if (!this._client) {
      return;
    }

    CLIENT_EVENTS.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this.client.off(eventName, this[`_${handlerFnName}`]);
    });
  }

  _removeScreenEventListeners() {
    if (!this._screenClient) {
      return;
    }

    SCREEN_CLIENT_EVENTS.forEach(eventName => {
      const handlerFnName = camelCase(`handle-screen-${eventName}`);
      this._screenClient.off(eventName, this[`_${handlerFnName}`]);
    });
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

  _getRoleOptions(role) {
    // Currently the only supported option is latency level and it is only
    // valid for audience so we are returning `null` for hosts else Agora SDK
    // raises exception.
    if (role === 'audience') {
      return this._audienceRoleOptions;
    } else {
      return null;
    }
  }

  _initLatencyListener() {
    this._latencyListener = setInterval(() => {
      const stats = this.client.getRTCStats();
      this._latency = parseInt(stats.RTT, 10);
      this._emitNetworkQualityUpdate();
    }, this._latencyUpdateInterval);
  }

  _isMyStream(streamId) {
    const [, userId] = parseStreamId(streamId);
    return this.userId === userId;
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

  _setBaseProperties() {
    this._remoteStreams = {};
  }

  _setInitialRole(role) {
    this._normalizedRole = role;
  }

  async _setCameraEnabled(enabled) {
    if (!this._cameraTrack) return;

    await this._cameraTrack.setEnabled(enabled);
    if (enabled) {
      await this._cameraTrack
        .setEncoderConfiguration(this._cameraEncoderProfile);
    }
  }

  async _setCameraEncoderProfile(profile) {
    this._cameraEncoderProfile = profile;
    if (this._cameraTrack?.enabled) {
      await this._cameraTrack
        .setEncoderConfiguration(this._cameraEncoderProfile);
    }
  }

  async _updateRoleOnServer() {
    await this._client.setClientRole(
      this._role,
      this._getRoleOptions(this._role),
    );
  }

  // Event handlers

  _handleIsUsingCloudProxy = (isUsingCloudProxy) => {
    this.emit(
      VIDEO_BROADCASTING_EVENTS.networkRestricted,
      { isNetworkRestricted: isUsingCloudProxy },
    );
  }

  _handleScreenShareStopped = () => {
    this.emit(VIDEO_BROADCASTING_EVENTS.screenShareStopped);
  }

  _handleConnectionStateChange = async (currState, _, reason) => {
    let normalizedState = null;
    switch (currState) {
      case AGORA_CONNECTION_STATES.connecting:
        normalizedState = VideoConnectionStates.connecting;
        break;
      case AGORA_CONNECTION_STATES.connected:
        normalizedState = VideoConnectionStates.connected;
        break;
      case AGORA_CONNECTION_STATES.reconnecting:
        normalizedState = VideoConnectionStates.reconnecting;
        break;
      case AGORA_CONNECTION_STATES.disconnected: {
        if (reason === 'LEAVE') {
          normalizedState = VideoConnectionStates.disconnected;
        } else {
          normalizedState = VideoConnectionStates.failed;
        }
        break;
      }
      default:
        normalizedState = null;
    }

    if (normalizedState) {
      this.emit(
        VIDEO_BROADCASTING_EVENTS.connectionStateChange, normalizedState,
      );
    }
  }

  // This is only called for remote hosts.
  _handleUserJoined = (remoteUser) => {
    const streamId = remoteUser.uid;
    if (this._isMyStream(streamId)) {
      return;
    }

    const remoteStream = new AgoraStream(this, remoteUser, true);
    this._remoteStreams[streamId] = remoteStream;
    this.emit(VIDEO_BROADCASTING_EVENTS.streamAdded, { stream: remoteStream });
  }

  // This is only called for remote hosts.
  _handleUserLeft = (remoteUser) => {
    const streamId = remoteUser.uid;
    if (this._isMyStream(streamId)) {
      return;
    }

    this._remoteStreams[streamId] = null;
    this.emit(VIDEO_BROADCASTING_EVENTS.streamRemoved, { id: streamId });
  }

  _handleUserPublished = (remoteUser, mediaType) => {
    const streamId = remoteUser.uid;
    const eventName = mediaType === 'audio' ? 'unmuteAudio' : 'unmuteVideo';
    this.emit(VIDEO_BROADCASTING_EVENTS[eventName], { id: streamId });
  }

  _handleUserUnpublished = (remoteUser, mediaType) => {
    const streamId = remoteUser.uid;
    const eventName = mediaType === 'audio' ? 'muteAudio' : 'muteVideo';
    this.emit(VIDEO_BROADCASTING_EVENTS[eventName], { id: streamId });
  }

  _handleVolumeIndicator = (result) => {
    const volumes = result.reduce((v, volume) => {
      // eslint-disable-next-line
      v[volume.uid] = volume.level;
      return v;
    }, {});
    this.emit(VIDEO_BROADCASTING_EVENTS.volumeIndicator, { volumes });
  }

  _handleNetworkQuality = (stats) => {
    this.downlinkQuality = stats.downlinkNetworkQuality;
    this.videoUplinkQuality = stats.uplinkNetworkQuality;
    this._emitNetworkQualityUpdate();
  }

  _handleStreamFallback = (uid, isFallbackOrRecover) => {
    this.emit(
      VIDEO_BROADCASTING_EVENTS.streamFallback,
      { id: uid, isFallback: isFallbackOrRecover === 'fallback' },
    );
  }

  _handleStreamTypeChanged = (uid) => {
    this.emit(
      VIDEO_BROADCASTING_EVENTS.streamFallback,
      { id: uid, isFallback: false },
    );
  }

  _handleScreenNetworkQuality = (stats) => {
    this.screenUplinkQuality = stats.uplinkNetworkQuality;
    this._emitNetworkQualityUpdate();
  }

  // Private getters

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

  get _audienceLatencyLevel() {
    if (this.options.useStandardStreaming) {
      return AGORA_LATENCY_LEVELS.standard;
    } else {
      return AGORA_LATENCY_LEVELS.premium;
    }
  }

  get _mode() {
    return this.options.mode || 'live';
  }

  get _audienceRoleOptions() {
    return {
      level: this._audienceLatencyLevel,
    };
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
