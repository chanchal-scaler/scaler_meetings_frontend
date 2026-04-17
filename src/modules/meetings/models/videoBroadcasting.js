import {
  action, computed, flow, makeObservable, observable, reaction,
} from 'mobx';
import camelCase from 'lodash/camelCase';
import forOwn from 'lodash/forOwn';
import orderBy from 'lodash/orderBy';
import takeRight from 'lodash/takeRight';

import {
  DRONA_FEATURES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import {
  isMacOS, MACOS_PRIVACY_SCREEN_CAPTURE_PREF_URL,
} from '@common/utils/platform';
import { isNullOrUndefined } from '@common/utils/type';
import { logEvent } from '@common/utils/logger';
import {
  JOIN_MODES,
  MEETING_ACTION_TRACKING,
  MEETING_RESOLUTION_CATEGORY,
} from '~meetings/utils/constants';
import { MediaCodecError, ServiceProviderError } from '~meetings/errors';
import { NetworkQuality } from '~meetings/utils/network';
import { sampleAssetUrl } from '@common/utils/constants';
import { screenMaximisedDefaultValue } from '~meetings/utils/meeting';
import { ScreenShareQuality } from '~meetings/utils/media';
import {
  StreamContentTypes,
  STREAMING_MODES,
  VideoStreamTypes,
} from '~meetings/utils/stream';
import { toHHmm } from '@common/utils/date';
import { VideoConnectionStates } from '~meetings/utils/videoConnection';
import _Communication from './_communication';
import analytics from '@common/utils/analytics';
import Agora from '~meetings/lib/agora';
import AudioNotification from '@common/lib/audioNotification';
import CDNStream from './cdnStream';
import layoutStore from '~meetings/stores/layoutStore';
import mediaStore from '~meetings/stores/mediaStore';
import meetingEvents from '~meetings/events';
import settingsStore from '~meetings/stores/settingsStore';
import SpeedTest from '@common/lib/speedTest';
import VIDEO_BROADCASTING_EVENTS from '~meetings/lib/videoBroadcasting.events';
import WebRTCComposedStream from './webRTCComposedStream';
import WebRTCGranularStream from './webRTCGranularStream';

// Specifies the interval in ms for updating stats
const STATS_UPDATE_FREQUENCY = 3000;

const VIDEO_BROADCASTING_LOADING_TIMEOUT = 30000;

const clientEvents = [
  VIDEO_BROADCASTING_EVENTS.connectionStateChange,
  VIDEO_BROADCASTING_EVENTS.volumeIndicator,
  VIDEO_BROADCASTING_EVENTS.streamAdded,
  VIDEO_BROADCASTING_EVENTS.streamRemoved,
  VIDEO_BROADCASTING_EVENTS.muteAudio,
  VIDEO_BROADCASTING_EVENTS.muteVideo,
  VIDEO_BROADCASTING_EVENTS.unmuteAudio,
  VIDEO_BROADCASTING_EVENTS.unmuteVideo,
  VIDEO_BROADCASTING_EVENTS.screenShareStopped,
  VIDEO_BROADCASTING_EVENTS.streamFallback,
  VIDEO_BROADCASTING_EVENTS.networkQuality,
  VIDEO_BROADCASTING_EVENTS.networkRestricted,
];

const screenConstraints = true;

const errorStates = [VideoConnectionStates.failed];

const alertNotification = new AudioNotification('alert');

const RECONNECTION_TIMEOUT = 15; // In secs

// Send network quality information to sherlock every 20 seconds
const NETWORK_QUALITY_TRACKING_INTERVAL = 20 * 1000; // In ms

const poorNetworkQualities = [NetworkQuality.average, NetworkQuality.bad];

// Atmost one speed test per 5 minutes
const speedTestInterval = 10 * 60 * 1000;

// Only start speed test if the network has been poor for 15 seconds
const poorNetworkTimeout = 15 * 1000;

// Perform upload optimisations if the upload speed is low for 10 seconds
const poorUploadTimeout = 18 * 1000;

class VideoBroadcasting extends _Communication {
  _lastSpeedTestAt = Date.now();

  _timeSinceNetworkQualityTracked = null;

  connectionState = VideoConnectionStates.connecting;

  pinnedStreamId = null;

  isInitialised = false;

  isStreaming = false;

  isStreamStarting = false;

  streamStartError = null;

  isScreenShareStarting = false;

  isSharingScreen = false;

  screenShareError = null;

  streams = observable.map({}, { deep: false });

  isStatsEnabled = false;

  isUpdatingStats = false;

  downlinkQuality = NetworkQuality.unknown;

  uplinkQuality = NetworkQuality.unknown;

  networkQuality = NetworkQuality.unknown;

  isScreenShareMaximised = false;

  isPoorUploadModalOpen = false;

  networkLatencyData = [];

  constructor(...args) {
    super(...args);

    this._setDefaults();
    this._addStreamsListReaction();
    makeObservable(this, {
      _createStream: action,
      _handleNetworkQuality: action,
      avStream: computed,
      networkQuality: observable,
      connectionState: observable,
      downlinkQuality: observable,
      hasCDNStream: computed,
      hasIllustrativeContent: computed,
      hasPinnedStream: computed,
      hasTimeoutError: computed,
      isAutoPlayRestricted: computed,
      illustrativeStreams: computed,
      illustrativeStreamsOrderedByRank: computed,
      isCodecNotSupported: computed,
      isDownlinkPoor: computed,
      isNetworkPoor: computed,
      isLiveScreenShared: computed,
      isMainIllustrationLiveScreen: computed,
      isMultipleScreenShareAllowed: computed,
      isMyScreenShareActive: computed,
      isPoorUploadModalOpen: observable,
      isScreenShareMaximised: observable,
      isScreenShareStarting: observable,
      isSharingScreen: observable,
      isStalled: computed,
      isStatsEnabled: observable,
      isStreaming: observable,
      isStreamStarting: observable,
      isUplinkPoor: computed,
      localStreams: computed,
      mainIllustration: computed,
      networkLatencyData: observable,
      openSystemPreferences: action.bound,
      pinnedStreamId: observable,
      possibleUploadOptimisations: computed,
      primaryStreams: computed,
      remoteStreams: computed,
      removeStream: action,
      resetScreenShareError: action.bound,
      screenShareError: observable.ref,
      secondaryStreams: computed,
      setConnectionState: action,
      setPinnedStreamId: action.bound,
      setPoorUploadModalOpen: action.bound,
      setScreenShareMaximised: action.bound,
      setStatsEnabled: action.bound,
      streamsList: computed,
      streamStartError: observable.ref,
      totalResolution: computed,
      totalStreamingResolution: computed,
      uplinkQuality: observable,
      remoteVideoStreams: computed,
      webrtcScreenStreams: computed,
      webrtcStreamsList: computed,
    });
  }

  async initialise(joinMode = 'normal') {
    // do not join the video channel for companion mode
    if (joinMode === JOIN_MODES.companion) {
      this.isLoaded = true;
      return;
    }

    if (
      !super.initialise()
    ) return;

    await this.join();
  }

  /* Public methods/getters */

  addOrUpdateCDNStream(_stream, session) {
    const {
      uid: id,
      type,
      url: cdnUrl,
      user_id: userId,
    } = _stream;

    // Edge case handling if previous session's streams are still present with
    // user then destroy them first
    let stream = this.streams.get(id);
    if (stream && stream.sessionId !== session.id) {
      this.removeStream(id);
      stream = null;
    }

    if (!stream) {
      stream = new CDNStream(
        this,
        id,
        {
          userId, cdnUrl, type,
        },
        session,
      );
      this.streams.set(id, stream);
      this.meeting.dispatchEvent(
        meetingEvents.STREAM_ADDED,
        stream.toJSON(),
      );
    }

    // Mark the stream active if it is playing so that it is visible to user
    stream.setActive(session.isPlaying);
  }

  destroy = flow(function* () {
    clearTimeout(this._connectionStateTimeout);

    if (this._roleChangeReaction) {
      this._roleChangeReaction();
    }

    if (this._screenQualityReaction) {
      this._screenQualityReaction();
    }

    // stream link reaction disposer
    if (this._addStreamsListReaction) {
      this._addStreamsListReaction();
    }

    if (this._totalResolutionReaction) {
      this._totalResolutionReaction();
    }

    if (this._loadingTimeout) {
      clearTimeout(this._loadingTimeout);
    }

    this._removeEventListeners();

    this.streams.forEach(stream => stream.destroy());
    this.streams.clear();

    yield this.unshareScreen();
    yield this.unstreamMedia();

    yield this.client.destroy();

    this.isLoaded = false;
  })

  join = flow(function* () {
    if (this.isLoading) return;

    this.isLoading = true;
    this.loadError = null;
    this._watchLoading();

    try {
      // Any initialisation that need to be done before joining channel for the
      // provider will happen in the below method call
      // Initialisation should happen only once
      if (!this.isInitialised) {
        yield this.client.initialise();
        this.isInitialised = true;
      }

      this._addEventListeners();
      yield this.client.join();
      this._addRoleChangeReaction();
      this._addScreenQualityReaction();
      if (this.meeting.isSuperHost) {
        this._addTotalResolutionReaction();
      }
      this.isLoaded = true;
    } catch (error) {
      this.loadError = error;
      logEvent(
        'error',
        'VideoBroadcastError: Failed to join channel',
        error,
      );
      this.meeting.trackEvent(
        MEETING_ACTION_TRACKING.meetingVideoChannelJoinFailed,
        {
          hasError: true,
          errorMessage: error?.message
            || 'VideoBroadcastError: Failed to join channel',
          error,
        },
      );
    }

    this.isLoading = false;
  });

  removeStream(streamId) {
    const stream = this.streams.get(streamId);
    if (stream) {
      if (stream.type === VideoStreamTypes.av
        && stream.contentType === StreamContentTypes.cdn) {
        stream.session.pause();
        stream.setMuted('video', true);
        stream.setMuted('audio', true);
      } else {
        this.streams.delete(streamId);
        stream.destroy();
        this.meeting.dispatchEvent(
          meetingEvents.STREAM_REMOVED,
          stream.toJSON(),
        );
      }
    }
  }

  // browser would need a restart to apply the changes
  openSystemPreferences() {
    if (isMacOS()) {
      window.open(MACOS_PRIVACY_SCREEN_CAPTURE_PREF_URL, '_blank');
      this.resetScreenShareError();
    }
  }

  resetScreenShareError() {
    this.screenShareError = null;
  }

  setConnectionState(state) {
    this.connectionState = state;
    if (errorStates.includes(state)) {
      alertNotification.play();
    }

    this.meeting.track(`video-${state}`);
  }

  setMute(type, isMuted) {
    if (type === 'screen' && !this.isSharingScreen) return;

    if ((type === 'audio' || type === 'video') && !this.isStreaming) return;

    this.client.setMute(type, isMuted);
  }

  setMuteForAllStreams(isMuted) {
    this.setMute('audio', isMuted);
    this.setMute('video', isMuted);
    this.setMute('screen', isMuted);
  }

  setPinnedStreamId(streamId) {
    this.pinnedStreamId = streamId;
  }

  setPoorUploadModalOpen(isOpen) {
    this.isPoorUploadModalOpen = isOpen;
  }

  setScreenShareMaximised(isMaximised) {
    this.isScreenShareMaximised = isMaximised;
  }

  setStatsEnabled(enabled) {
    this.isStatsEnabled = enabled;

    if (enabled) {
      this._loadStats();
    }
  }

  switchDevice(deviceType, deviceId) {
    if (this.isStreaming) {
      this.client.switchDevice(deviceType, deviceId);
    }
  }

  shareScreen = flow(function* () {
    if (this.isScreenShareStarting) return;

    this.isScreenShareStarting = true;
    this.screenShareError = null;

    try {
      this.currentScreenQuality = mediaStore.screenQuality;
      yield this.client.shareScreen(mediaStore.screenQuality);
      this.isSharingScreen = true;
      this.meeting.trackEvent(
        MEETING_ACTION_TRACKING.screenShared,
        {
          screenQuality: mediaStore.screenQuality,
        },
      );
    } catch (error) {
      this.screenShareError = error;
      logEvent(
        'error',
        'VideoBroadcastError: Failed to start screen share',
        error,
      );
      this.meeting.trackEvent(
        MEETING_ACTION_TRACKING.screenShareFailed,
        {
          hasError: true,
          errorMessage: error?.message
            || 'VideoBroadcastError: Failed to start screen share',
          error,
        },
      );
    }

    this.isScreenShareStarting = false;
  });

  /**
   * Call this method to initialise appropriate media sources before publishing
   * any stream
   */
  streamMedia = flow(function* () {
    const {
      audio, audioDeviceId, video, videoDeviceId,
    } = mediaStore;
    const { joinWithAudio, joinWithVideo } = this.meeting;

    if (
      this.isStreaming
      || this.isStreamStarting
      || !(audio || video)
    ) {
      return;
    }

    this.isStreamStarting = true;
    this.streamStartError = null;
    try {
      if (this.client.isLegacy) {
        if (audio && video) {
          yield this._createAndSetAVMediaStream();
        } else if (audio) {
          yield this._createAndSetAudioMediaStream();
        } else if (video) {
          yield this._createAndSetVideoMediaStream();
        }

        yield this.client.streamAudioAndVideo(audio, video);
      } else {
        yield this.client.streamAudioAndVideo(
          { enabled: audio, deviceId: audioDeviceId, muted: !joinWithAudio },
          { enabled: video, deviceId: videoDeviceId, muted: !joinWithVideo },
        );
      }


      this.isStreaming = true;
      this.meeting.trackEvent(
        MEETING_ACTION_TRACKING.audioVideoShared,
        {
          audioEnabled: audio,
          videoEnabled: video,
          audioMuted: !joinWithAudio,
          videoMuted: !joinWithVideo,
          audioDeviceId,
          videoDeviceId,
        },
      );
    } catch (error) {
      this.streamStartError = error;
      logEvent(
        'error',
        'VideoBroadcastError: Failed to start share audio/video',
        error,
      );
      this.meeting.trackEvent(
        MEETING_ACTION_TRACKING.audioVideoShareFailed,
        {
          audioEnabled: audio,
          videoEnabled: video,
          audioMuted: !joinWithAudio,
          videoMuted: !joinWithVideo,
          audioDeviceId,
          videoDeviceId,
          hasError: true,
          errorMessage: error?.message
            || 'VideoBroadcastError: Failed to start share audio/video',
          error,
        },
      );
    }

    this.isStreamStarting = false;
  });

  unshareScreen = flow(function* () {
    if (this.isSharingScreen) {
      try {
        yield this.client.unshareScreen();
        this.meeting.trackEvent(
          MEETING_ACTION_TRACKING.stopScreenShare,
          {
            screenQuality: mediaStore.screenQuality,
          },
        );
      } catch (error) {
        // Ignore error
        logEvent(
          'error',
          'VideoBroadcastError: Failed to stop screen share',
          error,
        );
        this.meeting.trackEvent(
          MEETING_ACTION_TRACKING.stopScreenShareFailed,
          {
            screenQuality: mediaStore.screenQuality,
            hasError: true,
            errorMessage: error?.message
              || 'VideoBroadcastError: Failed to stop screen share',
            error,
          },
        );
      }
      this.isSharingScreen = false;
    }
  });

  unstreamMedia = flow(function* () {
    if (this.isStreaming) {
      try {
        yield this.client.unstreamAudioAndVideo();
        this.meeting.trackEvent(
          MEETING_ACTION_TRACKING.stoppedAudioVideo,
        );
      } catch (error) {
        logEvent(
          'error',
          'VideoBroadcastError: Failed to stop av stream',
          error,
        );
        this.meeting.trackEvent(
          MEETING_ACTION_TRACKING.stopAudioVideoFailed,
          {
            hasError: true,
            errorMessage: error?.message
              || 'VideoBroadcastError: Failed to stop av stream',
            error,
          },
        );
      }
      this.isStreaming = false;
    }
  });

  updateToken(token) {
    this.client.updateToken(token);
  }

  get avStream() {
    return this.localStreams.find(stream => !stream.isScreenShare);
  }

  get billingCategory() {
    return this.client.getBillingCategory(this.totalStreamingResolution);
  }

  get micStream() {
    return this.client.micStream;
  }

  get canLogNetworkDetails() {
    return !this.meeting.isLarge;
  }

  get hasCDNStream() {
    let hasCDNStream = false;
    this.streams.forEach(stream => {
      if (stream.contentType === StreamContentTypes.cdn) {
        hasCDNStream = true;
      }
    });
    return hasCDNStream;
  }

  get hasPinnedStream() {
    return Boolean(this.pinnedStreamId);
  }

  get hasIllustrativeContent() {
    return this.illustrativeStreams.length > 0;
  }

  get hasTimeoutError() {
    return (
      this.loadError instanceof ServiceProviderError
      && this.loadError.code === 'SERVICE_PROVIDER_TIMEOUT'
    );
  }

  get localStreams() {
    return this.webrtcStreamsList.filter(o => !o.isRemote);
  }

  get mainIllustration() {
    return this.illustrativeStreams[0];
  }

  get primaryStreams() {
    if (this.isScreenShareMaximised) {
      if (this.hasIllustrativeContent) {
        return [this.mainIllustration];
      } else {
        return [];
      }
    } else {
      return this.streamsList;
    }
  }

  get illustrativeStreams() {
    return this.streamsList.filter(o => o.isIllustrative);
  }

  get remoteStreams() {
    return this.webrtcStreamsList.filter(o => o.isRemote);
  }

  get remoteVideoStreams() {
    return this.streamsList.filter(o => (o.isRemote && o.isVideoContent));
  }

  get webrtcScreenStreams() {
    return this.webrtcStreamsList.filter(o => o.isScreenShare);
  }

  get secondaryStreams() {
    if (this.isScreenShareMaximised) {
      return this.streamsList.filter(o => !o.isIllustrative);
    } else {
      return [];
    }
  }

  get isAutoPlayRestricted() {
    return this.remoteVideoStreams.some(o => o.isAutoPlayRestricted);
  }

  get isCodecNotSupported() {
    return (this.loadError instanceof MediaCodecError);
  }

  get isDownlinkPoor() {
    return poorNetworkQualities.includes(this.downlinkQuality);
  }

  get isNetworkPoor() {
    return poorNetworkQualities.includes(this.networkQuality);
  }

  get isMultipleScreenShareAllowed() {
    return this.manager.settings.allow_multiple_screenshare;
  }

  get isMyScreenShareActive() {
    return (
      this.isSharingScreen
      && this.mainIllustration.contentType === StreamContentTypes.webrtc
      && this.mainIllustration.userId === this.userId
    );
  }

  get isLiveScreenShared() {
    return this.webrtcScreenStreams.some(o => !o.isPreRecorded);
  }

  get isMainIllustrationLiveScreen() {
    return (
      this.mainIllustration
      && this.mainIllustration.contentType === StreamContentTypes.webrtc
      && !this.mainIllustration.isPreRecorded
    );
  }

  get isStalled() {
    return this.remoteStreams.some(o => o.isStalled);
  }

  get isUplinkPoor() {
    return (
      (this.isStreaming || this.isSharingScreen)
      && poorNetworkQualities.includes(this.uplinkQuality)
    );
  }

  get totalResolution() {
    return this.webrtcStreamsList.reduce((total, stream) => {
      let resolution = 0;
      if (stream.stats) {
        resolution = stream.stats.width * stream.stats.height;
      }
      return total + resolution;
    }, 0);
  }

  get totalStreamingResolution() {
    return this.webrtcStreamsList.reduce((total, stream) => {
      let resolution = 0;
      if (stream.isRemote && stream.stats) {
        resolution = stream.stats.width * stream.stats.height;
      }
      return total + resolution;
    }, 0);
  }

  get possibleUploadOptimisations() {
    const optimisations = [];
    if (this.avStream && !this.avStream.isVideoMuted) {
      optimisations.push('video');
    }

    if (
      this.isSharingScreen
      && mediaStore.screenQuality !== ScreenShareQuality.low
    ) {
      optimisations.push('screen');
    }

    return optimisations;
  }

  /**
   * Orders in which streams are returned is in the following order
   * 1. Screen share stream of pre recorded video.
   * 2. Pinned stream if any (The one which user wishes to maximise).
   * 3. Stream that has live screen share.
   * 4. In case of multiple live screen shares then one that is currently
   *    active and then the remaining screen share streams.
   * 3. And then the remaining streams in the order of their volume levels.
   */
  get streamsList() {
    const streams = [];
    this.streams.forEach(stream => {
      if (stream.isActive && stream.shouldRender) {
        streams.push(stream);
      }
    });

    return orderBy(
      streams,
      [
        o => o.id === this.pinnedStreamId,
        'primaryRank',
        'secondaryRank',
      ],
      ['desc', 'desc', 'desc'],
    );
  }

  // screen share stream list for recorded + live streams
  // this does not take user pinned screen into account
  get illustrativeStreamsOrderedByRank() {
    return orderBy(
      this.illustrativeStreams,
      [
        'primaryRank',
        'secondaryRank',
      ],
      ['desc', 'desc'],
    );
  }

  get webrtcStreamsList() {
    return this.streamsList.filter(
      o => o.contentType === StreamContentTypes.webrtc,
    );
  }

  /* Event handlers */

  _handleNetworkRestricted = ({ isNetworkRestricted }) => {
    this.meeting.setIsNetworkRestricted(isNetworkRestricted);

    if (isNetworkRestricted) {
      this.meeting.trackEvent(
        MEETING_ACTION_TRACKING.networkRestricted,
        { isNetworkRestricted },
      );
    }
  }

  _handleConnectionStateChange = (state) => {
    this.setConnectionState(state);
    this._notifyComposedVideoSessionsOfConnectionChange(state);

    // Auto change reconnecting state to failed if it does not reconnect
    // in some time
    if (
      state === VideoConnectionStates.reconnecting
      && isNullOrUndefined(this._connectionStateTimeout)
    ) {
      this._connectionStateTimeout = setTimeout(() => {
        if (this.connectionState === VideoConnectionStates.reconnecting) {
          this.setConnectionState(VideoConnectionStates.failed);
        }
        this._connectionStateTimeout = null;
      }, RECONNECTION_TIMEOUT * 1000);
    }
  }

  _handleVolumeIndicator = ({ volumes }) => {
    this.streams.forEach(stream => {
      // Only valid for webrtc streams
      if (stream.contentType !== StreamContentTypes.webrtc) {
        return;
      }
      const level = volumes[stream.id] || 0;
      stream.setVolume(level);
    });
  }

  _handleStreamAdded = ({ stream }) => {
    this._createStream(stream);
  }

  _handleStreamRemoved = (event) => {
    this.removeStream(event.id);
  }

  _handleMuteAudio = event => this._toggleMute(event.id, 'audio', true);

  _handleMuteVideo = event => this._toggleMute(event.id, 'video', true);

  _handleUnmuteAudio = event => this._toggleMute(event.id, 'audio', false);

  _handleUnmuteVideo = event => this._toggleMute(event.id, 'video', false);

  _handleScreenShareStopped = () => this.unshareScreen();

  _handleNetworkQuality = (event) => {
    this.downlinkQuality = event.downlink;
    this.uplinkQuality = event.uplink;
    this.networkQuality = event.networkQuality;

    this._optimiseIfPoorNetwork();
    this._logNetworkDetails(event.extra);

    if (event.extra.networkQuality) {
      const updatedLatencyData = [
        ...this.networkLatencyData,
        {
          latency: event.extra.networkQuality,
          datetime: toHHmm(new Date()),
          warningLatency: 300,
          dangerLatency: 500,
        },
      ];

      this.networkLatencyData = takeRight(updatedLatencyData, 300);
    }
  }

  _handleStreamFallback = (event) => {
    const stream = this.streams.get(event.id);
    if (stream) {
      stream.setAudioFallback(event.isFallback);
      if (event.isFallback) {
        this.meeting.track('remote-video-disabled');
      }
    }
  }

  /* Private */

  _addEventListeners() {
    clientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);

      // To make sure that we never add more than one listener for every event
      this.client.off(eventName, this[`_${handlerFnName}`]);
      this.client.on(eventName, this[`_${handlerFnName}`]);
    });
  }

  _addRoleChangeReaction() {
    this._roleChangeReaction = reaction(
      () => this.role,
      () => this.client.setRole(this.role),
    );
  }

  _addScreenQualityReaction() {
    this._screenQualityReaction = reaction(
      () => mediaStore.screenQuality,
      () => {
        if (this.isSharingScreen) {
          this.client.setScreenQuality(mediaStore.screenQuality);
        }
      },
    );
  }

  _addTotalResolutionReaction() {
    this._totalResolutionReaction = reaction(
      () => this.totalResolution,
      (totalRes) => {
        if (totalRes > MEETING_RESOLUTION_CATEGORY.fhd) {
          analytics.log({
            log_type: DRONA_TRACKING_TYPES.dronaMeetingHighResolutionLog,
            log_feature: DRONA_FEATURES.videoBroadcasting,
            log_value: `Total resolution of meeting is ${totalRes}`,
          });
        }
      },
    );
  }

  _addStreamsListReaction() {
    this._streamsListReaction = reaction(
      () => this.streamsList.length,
      () => this._reorderStreamLayout(),
      { fireImmediately: true },
    );
  }

  _createAgoraClient() {
    const {
      sdk_version: sdkVersion,
      standard_streaming: standardStreaming,
    } = this.meeting.config || {};

    // resolution config meeting based av/avScreen stream
    const resolutionConfig = this.meeting?.resolutionConfig || {};
    const AgoraClient = sdkVersion === 4
      ? Agora.VideoBroadcastingV4
      : Agora.VideoBroadcasting;

    this._client = new AgoraClient(
      this.providerKeys,
      this.channelName,
      this.userId,
      this.token,
      {
        useProxy: settingsStore.cloudProxyEnabled,
        useStandardStreaming: standardStreaming,
        resolutionConfig,
      },
      this.role,
    );
  }

  _createStream(_stream) {
    const { id } = _stream;
    if (!this.streams.has(id)) {
      const stream = _stream.mode === STREAMING_MODES.composed
        ? new WebRTCComposedStream(this, _stream)
        : new WebRTCGranularStream(this, _stream);
      this.streams.set(id, stream);
      this.meeting.dispatchEvent(
        meetingEvents.STREAM_ADDED,
        stream.toJSON(),
      );
    }
  }

  _createAndSetAVMediaStream = flow(function* () {
    const {
      audio,
      audioDeviceId,
      setEnabledHardware,
      setHardwareError,
      audioConstraints,
      videoConstraints,
      videoDeviceId,
    } = mediaStore;

    try {
      const avMediaStream = yield navigator
        .mediaDevices
        .getUserMedia({
          video: videoConstraints,
          audio: audioConstraints,
        });

      this.client.setVideoSource(
        avMediaStream,
        videoDeviceId,
        this.meeting.joinWithVideo,
      );
      this.client.setAudioSource(
        avMediaStream,
        audioDeviceId,
        this.meeting.joinWithAudio,
      );
    } catch (error) {
      setHardwareError(error, 'video');
      setEnabledHardware({ audio, video: false });
      /**
       * Retry with audio if both audio/video fails
       */
      yield this._createAndSetAudioMediaStream();
      logEvent(
        'error',
        'InCallVideoBroadcastError: Failed to start av stream',
        error,
      );
    }
  })

  _createAndSetVideoMediaStream = flow(function* () {
    const {
      audio,
      setEnabledHardware,
      setHardwareError,
      video,
      videoConstraints,
      videoDeviceId,
    } = mediaStore;

    try {
      const videoMediaStream = yield navigator
        .mediaDevices
        .getUserMedia({ video: video ? videoConstraints : false });

      this.client.setVideoSource(
        videoMediaStream,
        videoDeviceId,
        this.meeting.joinWithVideo,
      );
    } catch (error) {
      setHardwareError(error, 'video');
      setEnabledHardware({ audio, video: false });
      logEvent(
        'error',
        'InCallVideoBroadcastError: Failed to start video stream',
        error,
      );
    }
  })

  _createAndSetAudioMediaStream = flow(function* () {
    const {
      audio,
      audioConstraints,
      audioDeviceId,
      setEnabledHardware,
      setHardwareError,
      video,
    } = mediaStore;

    try {
      const audioMediaStream = yield navigator
        .mediaDevices
        .getUserMedia({ audio: audio ? audioConstraints : false });

      this.client.setAudioSource(
        audioMediaStream,
        audioDeviceId,
        this.meeting.joinWithAudio,
      );
    } catch (error) {
      setHardwareError(error, 'audio');
      setEnabledHardware({ audio: false, video });
      logEvent(
        'error',
        'InCallVideoBroadcastError: Failed to start audio stream',
        error,
      );
    }
  })

  // eslint-disable-next-line
  _getDisplayMedia() {
    let getDisplayMedia;

    if (navigator.getDisplayMedia) {
      getDisplayMedia = navigator.getDisplayMedia.bind(navigator);
    }

    if (navigator.mediaDevices.getDisplayMedia) {
      getDisplayMedia = navigator.mediaDevices
        .getDisplayMedia
        .bind(navigator.mediaDevices);
    }

    if (isNullOrUndefined(getDisplayMedia)) {
      throw new Error('Screen sharing is not supported on your browser!');
    } else {
      return getDisplayMedia({ video: screenConstraints });
    }
  }

  async _loadStats() {
    if (this.isUpdatingStats) {
      return;
    }

    this.isUpdatingStats = true;

    try {
      const promises = this.webrtcStreamsList.map(stream => stream.loadStats());
      await Promise.all(promises);
    } catch (error) {
      logEvent(
        'error',
        'VideoBroadcastError: Failed to load stats',
        error,
      );
    }

    this.isUpdatingStats = false;

    if (this.isStatsEnabled) {
      setTimeout(() => this._loadStats(), STATS_UPDATE_FREQUENCY);
    }
  }

  _notifyComposedVideoSessionsOfConnectionChange(state) {
    if (this.meeting && this.meeting.composedVideoSessions) {
      this.meeting.composedVideoSessions.forEach(session => {
        if (typeof session.handleConnectionStateChange === 'function') {
          session.handleConnectionStateChange(state);
        }
      });
    }
  }

  _optimiseIfPoorNetwork() {
    if (this.isNetworkPoor) {
      if (!this._isUnsubscribeVideoEnqueued) {
        this._isUnsubscribeVideoEnqueued = true;
        this._unsubscribeVideoTimeout = setTimeout(() => {
          this.remoteStreams.forEach(stream => {
            if (!stream.isScreenShare) {
              stream.setVideoDisabled('network');
            }
          });
        }, poorNetworkTimeout / 3);
      }
    } else {
      clearTimeout(this._unsubscribeVideoTimeout);
      this._isUnsubscribeVideoEnqueued = false;
    }

    if (
      this.isNetworkPoor
      && this.possibleUploadOptimisations.length > 0
      && mediaStore.recommendedScreenQuality !== ScreenShareQuality.low
    ) {
      if (!this._isUploadOptimisationEnqueued) {
        this._isUploadOptimisationEnqueued = true;
        this._uploadOptimisationTimeout = setTimeout(() => {
          mediaStore.setRecommendedScreenQuality(ScreenShareQuality.low);
          if (this.possibleUploadOptimisations.length > 0) {
            this.setPoorUploadModalOpen(true);
          }
          this.meeting.track('poorUploadDetected');
        }, poorUploadTimeout);
      }
    } else {
      clearTimeout(this._uploadOptimisationTimeout);
      this._isUploadOptimisationEnqueued = false;
    }
  }

  _removeEventListeners() {
    clientEvents.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);
      this.client.off(eventName, this[`_${handlerFnName}`]);
    });
  }

  // to replace user's pinned screen with ASL screen-share
  _reorderStreamLayout() {
    // check if user had pinned screen, and replace it with
    // recorded lecture's main screen if he does
    if (this.hasPinnedStream) {
      // if pre recorded screens found, replace current pinned stream id
      if (this.illustrativeStreamsOrderedByRank.length > 0) {
        const [primaryStream] = this.illustrativeStreamsOrderedByRank;
        this.setPinnedStreamId(primaryStream.id);
      } else if (!this.streams.has(this.pinnedStreamId)) {
        this.setPinnedStreamId(null);
      }
    }
  }

  _setDefaults() {
    if (layoutStore.isScreenMaximiseAllowed) {
      this.isScreenShareMaximised = screenMaximisedDefaultValue(
        this.meeting.type,
      );
    }
  }

  _toggleMute(streamId, type, isMuted) {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.setMuted(type, isMuted);
    }
  }

  _logNetworkDetails(data) {
    if (SpeedTest.isEnabled() && this.isNetworkPoor) {
      const durationAfterLastTest = Date.now() - this._lastSpeedTestAt;
      if (
        !this.isSpeedTestEnqueued
        && durationAfterLastTest > speedTestInterval
      ) {
        this.isSpeedTestEnqueued = true;
        this._speedTestTimeout = setTimeout(async () => {
          if (this.isNetworkPoor) {
            const speedTest = new SpeedTest(sampleAssetUrl);
            const result = await speedTest.measureDownlink(10000);
            this.meeting.track('download-speed', 'log', result.speed);
            this.meeting.trackEvent(
              MEETING_ACTION_TRACKING.downloadSpeedLog,
              {
                speed: result.speed,
              },
            );
            this._lastSpeedTestAt = Date.now();
          }
          this.isSpeedTestEnqueued = false;
        }, poorNetworkTimeout);
      }
    } else {
      clearTimeout(this._speedTestTimeout);
      this.isSpeedTestEnqueued = false;
    }

    if (this.canLogNetworkDetails) {
      const timeElapsed = this._timeSinceNetworkQualityTracked;
      if (
        isNullOrUndefined(timeElapsed)
        || timeElapsed >= NETWORK_QUALITY_TRACKING_INTERVAL
      ) {
        forOwn(data, (v, k) => {
          this.meeting.track(camelCase(`network-${k}`), 'log', v);
        });

        const {
          track_call_quality: trackCallQuality,
        } = this.meeting.config || {};
        if (trackCallQuality) {
          this.meeting.trackEvent(
            MEETING_ACTION_TRACKING.callQualityLog,
            data,
          );
        }

        this._timeSinceNetworkQualityTracked = 0;
      } else {
        this._timeSinceNetworkQualityTracked
          += this.client.networkQualityUpdateInterval;
      }
    }
  }

  // watch isLoading for 30 seconds, if it's still true after that,
  // then we assume the meeting is not loading and we can show error
  // help nudge to the user
  _watchLoading() {
    clearTimeout(this._loadingTimeout);
    this._loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.loadError = new ServiceProviderError(
          'SERVICE_PROVIDER_TIMEOUT',
          this.provider,
        );
        this.isLoading = false;
        this.meeting.track('meeting-failed-to-load');
      }
    }, VIDEO_BROADCASTING_LOADING_TIMEOUT);
  }
}

export default VideoBroadcasting;
