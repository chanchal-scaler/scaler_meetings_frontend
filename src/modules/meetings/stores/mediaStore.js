import {
  action, computed, flow, makeObservable, observable,
} from 'mobx';
import forOwn from 'lodash/forOwn';

import { isNullOrUndefined } from '@common/utils/type';
import { logEvent } from '@common/utils/logger';
import { ScreenShareQuality } from '~meetings/utils/media';
import { wait } from '@common/utils/async';
import LocalStorage from '@common/lib/localStorage';
import MediaSourceError, {
  MEDIA_SOURCE_ERRORS,
} from '~meetings/errors/mediaSourceError';

const lsKey = '__dr__media__';
const lsItemKeys = {
  audioDeviceId: '__a_id__',
  screenQuality: '__s_qa__',
  speakerDeviceId: '__s_id__',
  videoDeviceId: '__v_id__',
  userOnboarded: '__u_on__',
};

const defaultValues = {
  audioDeviceId: 'default',
  screenQuality: ScreenShareQuality.medium,
  speakerDeviceId: 'default',
  videoDeviceId: 'default',
  userOnboarded: false,
};

export const HardwarePermissionStatus = {
  unknown: 'unknown',
  prompt: 'prompt',
  granted: 'granted',
  denied: 'denied',
  dismissed: 'dismissed',
};

const canPromptStatues = [
  HardwarePermissionStatus.unknown,
  HardwarePermissionStatus.prompt,
];

class MediaStore {
  _mediaDevices = [];

  audioPermissionState = HardwarePermissionStatus.unknown;

  audioHardwareError = null;

  videoPermissionState = HardwarePermissionStatus.unknown;

  videoHardwareError = null;

  isRequestingAudioPermissions = false;

  isRequestingVideoPermissions = false;

  isRequestingPermissions = false;

  isLoading = false;

  loadError = null;

  audio = true;

  video = true;

  audioDeviceId = defaultValues.audioDeviceId;

  videoDeviceId = defaultValues.videoDeviceId;

  speakerDeviceId = defaultValues.speakerDeviceId;

  screenQuality = defaultValues.screenQuality;

  recommendedScreenQuality = ScreenShareQuality.medium;

  onboardingRequired = false;

  showPermissionsGuide = false;

  videoStreamLoading = false;

  audioStreamLoading = false;

  constructor() {
    makeObservable(this, {
      _initializeLS: action,
      _mediaDevices: observable.ref,
      _setPermissionError: action,
      audio: observable,
      audioConstraints: computed,
      audioDeviceId: observable,
      audioInputs: computed,
      audioPermissionState: observable,
      audioStreamLoading: observable,
      audioHardwareError: observable,
      checkOnboardingRequired: action,
      enabledAVStreamsLoading: computed,
      hasAudioPermissions: computed,
      hasAudioHardwareError: computed,
      hasVideoHardwareError: computed,
      hasVideoPermissions: computed,
      hasDefaultAudioInput: computed,
      hasDefaultVideoInput: computed,
      isLoading: observable,
      isRequestingVideoPermissions: observable,
      isRequestingAudioPermissions: observable,
      loadError: observable.ref,
      mediaDevices: computed,
      onboardingRequired: observable,
      showPermissionsGuide: observable,
      recommendedScreenQuality: observable,
      resetHardwareError: action,
      requestVideoPermissions: action,
      requestAudioPermissions: action,
      screenQuality: observable,
      setAudioStreamLoading: action,
      setDevice: action.bound,
      setEnabledHardware: action.bound,
      setOnboardingRequired: action.bound,
      setHardwareError: action.bound,
      setShowPermissionsGuide: action.bound,
      setRecommendedScreenQuality: action.bound,
      setScreenQuality: action.bound,
      resetScreenQuality: action.bound,
      setVideoStreamLoading: action,
      hasPermissions: computed,
      speakerDeviceId: observable,
      video: observable,
      videoConstraints: computed,
      videoDeviceId: observable,
      videoHardwareError: observable,
      videoInputs: computed,
      videoPermissionState: observable,
      videoStreamLoading: observable,
    });
    this._initializeLS();
  }

  /* Public */

  loadDevices = flow(function* () {
    if (this.isLoading) return;

    this.isLoading = true;
    this.loadError = null;

    try {
      const mediaDevices = yield navigator.mediaDevices.enumerateDevices();
      this._mediaDevices = mediaDevices;
      this._setDefaultDevices();
    } catch (error) {
      this.loadError = error;
      logEvent(
        'error',
        'MediaError: Failed to device list',
        error,
      );
    }

    this.isLoading = false;
  })

  requestPermissions = flow(function* (force = false) {
    if (!force && (this.hasPermissions || this.isRequestingPermissions)) {
      return;
    }

    this.isRequestingPermissions = true;
    yield this._populatePermissionState();

    /**
     * We are using wait here to make sure that the browser has time to
     * load media stream from audio or video devices then we request
     * for permission to make sure we have camera blocked icon in the
     * address bar if needed.
     */
    yield wait(10);

    const audioVideoPermissionsBlocked = (
      !this.hasVideoPermissions && !this.hasAudioPermissions
    );
    /**
     * Only ask for devices that are not already granted
     */
    if (
      (this.video && this.audio) // both audio video enabled
      && audioVideoPermissionsBlocked
    ) {
      yield this.requestAudioVideoPermissions();
    } else if (this.video && !this.hasVideoPermissions) {
      yield this.requestVideoPermissions();
    } else if (this.audio && !this.hasAudioPermissions) {
      yield this.requestAudioPermissions();
    }

    /**
     * Reload device list to populate select options with the new devices
     */
    yield this.loadDevices();
    yield this._populatePermissionState();
    this._addDeviceChangeListener();

    this.isRequestingPermissions = false;
  })

  /* Call this methods only when `hasMediaDevicesSupport` returns true */
  requestAudioVideoPermissions = flow(function* () {
    this.isRequestingAudioPermissions = true;
    this.isRequestingVideoPermissions = true;

    try {
      const mediaStream = yield navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mediaStream.getTracks().forEach((track) => track.stop());
      this.videoPermissionState = HardwarePermissionStatus.granted;
      this.audioPermissionState = HardwarePermissionStatus.granted;
      this.resetHardwareError('video');
      this.resetHardwareError('audio');
    } catch (error) {
      /**
       * 1. both auido and video devices denied
       * 2. one of the devices failed
       * 3. both of the devices failed
       *
       * Now we check individual devices to see if we can
       * request for the device that is working fine.
       */
      yield this.requestVideoPermissions();
      yield this.requestAudioPermissions();
    }

    this.isRequestingAudioPermissions = false;
    this.isRequestingVideoPermissions = false;
  });

  /* Call this methods only when `hasMediaDevicesSupport` returns true */
  requestVideoPermissions = flow(function* () {
    this.isRequestingVideoPermissions = true;

    try {
      const mediaStream = yield navigator.mediaDevices.getUserMedia({
        video: true,
      });
      mediaStream.getTracks().forEach((track) => track.stop());
      this.videoPermissionState = HardwarePermissionStatus.granted;
      this.resetHardwareError('video');
    } catch (error) {
      this.setHardwareError(error, 'video');
      this._setPermissionError(error, 'video');
      this.setEnabledHardware({ audio: this.audio, video: false });
    }

    this.isRequestingVideoPermissions = false;
  });

  /* Call this methods only when `hasMediaDevicesSupport` returns true */
  requestAudioPermissions = flow(function* () {
    this.isRequestingAudioPermissions = true;

    try {
      const mediaStream = yield navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStream.getTracks().forEach((track) => track.stop());
      this.audioPermissionState = HardwarePermissionStatus.granted;
      this.resetHardwareError('audio');
    } catch (error) {
      this.setHardwareError(error, 'audio');
      this._setPermissionError(error, 'audio');
      this.setEnabledHardware({ audio: false, video: this.video });
    }

    this.isRequestingAudioPermissions = false;
  });

  checkOnboardingRequired() {
    const userOnboarded = this._localStorage[lsItemKeys.userOnboarded];
    if (userOnboarded) {
      this.onboardingRequired = false;
    } else {
      this.onboardingRequired = true;
    }
  }

  resetHardwareError(kind) {
    this[`${kind}HardwareError`] = null;
  }

  setEnabledHardware({ audio = false, video = false }) {
    this.audio = audio;
    this.video = video;
  }

  setShowPermissionsGuide(shouldPrompt) {
    this.showPermissionsGuide = shouldPrompt;
  }

  setRecommendedScreenQuality(quality) {
    this.recommendedScreenQuality = quality;
  }

  setScreenQuality(quality) {
    this.screenQuality = quality;
    this._localStorage[lsItemKeys.screenQuality] = quality;
  }

  resetScreenQuality() {
    this.setScreenQuality(defaultValues.screenQuality);
  }

  setOnboardingRequired(value, { replaceLS = true } = {}) {
    this.onboardingRequired = value;
    if (replaceLS) {
      this._localStorage[lsItemKeys.userOnboarded] = !value;
    }
  }

  setDevice({ target }) {
    const { name, value } = target;
    this[target.name] = value;
    this._localStorage[lsItemKeys[name]] = value;
  }

  /**
   *
   * @param {String} error - Error object from getUserMedia
   * @param {*} kind - audio or video
   *
   * Source https://blog.addpipe.com/common-getusermedia-errors/
   * Check and set the error message for the device
   */
  setHardwareError(error, kind) {
    // set onboarding required to true
    if (!isNullOrUndefined(error)) {
      this.setOnboardingRequired(true, { replaceLS: false });
    }

    // set hardware state
    if (
      error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError'
    ) {
      // required track is missing
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.MEDIA_NOT_FOUND,
        kind,
      );
    } else if (
      error.name === 'NotReadableError' || error.name === 'TrackStartError'
    ) {
      // webcam or mic are already in use
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.MEDIA_ALREADY_IN_USE,
        kind,
      );
    } else if (
      error.name === 'OverconstrainedError'
      || error.name === 'ConstraintNotSatisfiedError'
    ) {
      // constraints can not be satisfied by avb. devices
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.MEDIA_NOT_SUPPORTED,
        kind,
      );
    } else if (
      error.name === 'NotAllowedError'
      || error.name === 'PermissionDeniedError'
    ) {
      // permission denied in browser
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.PERMISSION_NOT_GRANTED,
        kind,
      );
    } else if (error.name === 'TypeError') {
      // empty constraints object
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.MEDIA_NOT_SUPPORTED,
        kind,
      );
    } else if (error.name === 'MediaStreamNotActive') {
      // empty constraints object
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.MEDIA_SOURCE_NOT_ACTIVE,
        kind,
      );
    } else if (error.name === 'NotSupportedError') {
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.MEDIA_NOT_SUPPORTED,
        kind,
      );
    } else if (error.name === 'AbortError') {
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.MEDIA_SOURCE_NOT_ACTIVE,
        kind,
      );
    } else if (error.name === 'TimeoutError') {
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.TIMEOUT_ERROR,
        kind,
      );
    } else {
      // other errors, generic fallback error, this could be triggered
      // due to a bug in browser/os/device
      this[`${kind}HardwareError`] = new MediaSourceError(
        MEDIA_SOURCE_ERRORS.MEDIA_SOURCE_NOT_ACTIVE,
        kind,
      );
    }
    logEvent(
      'error',
      `${kind}HardwareError: ${error.name}`,
      error,
    );
  }

  setAudioStreamLoading(isLoading) {
    this.audioStreamLoading = isLoading;
  }

  setVideoStreamLoading(isLoading) {
    this.videoStreamLoading = isLoading;
  }

  get enabledAVStreamsLoading() {
    return (
      (this.audio && this.audioStreamLoading)
      || (this.video && this.videoStreamLoading)
    );
  }

  get canPrompt() {
    if (
      !this.hasAudioPermissions
      && !canPromptStatues.includes(this.audioPermissionState)
    ) {
      return false;
    }

    if (
      !this.hasVideoPermissions
      && !canPromptStatues.includes(this.videoPermissionState)
    ) {
      return false;
    }

    return true;
  }

  get hasPermissions() {
    if (
      this.audio
      && this.audioPermissionState !== HardwarePermissionStatus.granted
    ) {
      return false;
    }

    if (
      this.video
      && this.videoPermissionState !== HardwarePermissionStatus.granted
    ) {
      return false;
    }

    return true;
  }

  get hasAudioPermissions() {
    return this.audioPermissionState === HardwarePermissionStatus.granted;
  }

  get hasVideoPermissions() {
    return this.videoPermissionState === HardwarePermissionStatus.granted;
  }

  get hasAudioHardwareError() {
    return !isNullOrUndefined(this.audioHardwareError);
  }

  /**
   * Host is required to have at least microphone device enabled
   */
  get hasMinimumHostAVRequirements() {
    return (
      this.audio
      && this.hasAudioPermissions
      && !this.hasAudioHardwareError
    );
  }

  get hasVideoHardwareError() {
    return !isNullOrUndefined(this.videoHardwareError);
  }

  get audioInputs() {
    return this._findDevicesOfKind('audioinput');
  }

  get audioOutputs() {
    return this._findDevicesOfKind('audiooutput');
  }

  get videoInputs() {
    return this._findDevicesOfKind('videoinput');
  }

  // eslint-disable-next-line
  get hasMediaDevicesSupport() {
    return !isNullOrUndefined(navigator.mediaDevices);
  }

  /**
   * @returns {boolean}
   * If user has a default device for audio system wide, then return true
   * otherwise return false
   */
  get hasDefaultAudioInput() {
    return this.audioInputs.some(({ deviceId }) => (
      deviceId === defaultValues.audioDeviceId
    ));
  }

  /**
   * @returns {boolean}
   * If user has a default device for video system wide, then return true
   * otherwise return false
   */
  get hasDefaultVideoInput() {
    return this.videoInputs.some(({ deviceId }) => (
      deviceId === defaultValues.videoDeviceId
    ));
  }

  get mediaDevices() {
    return this._mediaDevices;
  }

  /**
   * Either user can have a default device selected system wide or user could
   * have selected a device in the settings. In either of the cases we should
   * return true, else we should return false.
   */
  get hasSelectedAudioInput() {
    if (!this.hasDefaultAudioInput) {
      return this.audioDeviceId !== defaultValues.audioDeviceId;
    } else {
      return true;
    }
  }

  /**
   * Either user can have a default device selected system wide or user could
   * have selected a device in the settings. In either of the cases we should
   * return true, else we should return false.
   */
  get hasSelectedVideoInput() {
    if (!this.hasDefaultVideoInput) {
      return this.videoDeviceId !== defaultValues.videoDeviceId;
    } else {
      return true;
    }
  }

  get audioConstraints() {
    if (this.audioDeviceId && this.audioDeviceId !== 'default') {
      return { deviceId: { ideal: this.audioDeviceId } };
    } else {
      return { deviceId: undefined };
    }
  }

  get videoConstraints() {
    if (this.videoDeviceId && this.videoDeviceId !== 'default') {
      return { deviceId: { ideal: this.videoDeviceId } };
    } else {
      return { deviceId: undefined };
    }
  }

  /* Private */

  _addDeviceChangeListener() {
    // Just to make sure that we never add more than one listener
    navigator.mediaDevices.removeEventListener(
      'devicechange',
      this._handleDeviceChange,
    );

    navigator.mediaDevices.addEventListener(
      'devicechange',
      this._handleDeviceChange,
    );
  }

  _checkAndGuideUserForPermissions() {
    // if we dont have audio/camera permissions and browser cannot prompt
    // user to grant permissions, we should show a modal to guide user to
    // allow permissions from browser/system settings
    if (!this.canPrompt) {
      this.setShowPermissionsGuide(true);
      this.setOnboardingRequired(true, { replaceLS: false });
    }
  }

  _findDevicesOfKind(kind) {
    return this.mediaDevices.filter(o => o.kind === kind);
  }

  _handleDeviceChange = () => {
    this.loadDevices();
  }

  _initializeLS() {
    this._localStorage = LocalStorage.getInstance(lsKey);
    forOwn(lsItemKeys, (v, k) => {
      this[k] = this._localStorage[v] || defaultValues[k];
    });
  }

  /**
   * Strategy to get permission state of audio/video devices from browser,
   * before actually requesting permission through getUserMedia API. We use
   * navigator.permissions.query({video: true, audio: true}) if available
   * else we enumerate on devices to know permission status.
   * MDN: https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query
   */
  _populatePermissionState = flow(function* () {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        // get camera permission state
        const {
          state: videoPermissionState,
        } = yield navigator.permissions.query({ name: 'camera' });

        // get microphone permission state
        const {
          state: audioPermissionState,
        } = yield navigator.permissions.query({ name: 'microphone' });

        this.videoPermissionState = videoPermissionState;
        this.audioPermissionState = audioPermissionState;
      } catch (error) {
        logEvent(
          'error',
          'Error getting permission state',
          error,
        );
      }
    } else {
      /**
       * load media devices to enumerate on all available devices in the next
       * step this hints the browser to on which permissions to ask for.
       */
      yield this.loadDevices();

      if (this.audioInputs.some(({ deviceId }) => deviceId !== '')) {
        this.audioPermissionState = HardwarePermissionStatus.granted;
      }

      if (this.videoInputs.some(({ deviceId }) => deviceId !== '')) {
        this.videoPermissionState = HardwarePermissionStatus.granted;
      }
    }

    /**
     * Reset permission state error if previous state was denied
     */
    if (
      this.videoHardwareError
      && (
        this.videoHardwareError.code
        === MEDIA_SOURCE_ERRORS.PERMISSION_NOT_GRANTED
      )
      && this.videoPermissionState === HardwarePermissionStatus.granted
    ) {
      this.resetHardwareError('video');
    }
    if (
      this.audioHardwareError
      && (
        this.audioHardwareError.code
        === MEDIA_SOURCE_ERRORS.PERMISSION_NOT_GRANTED
      )
      && this.audioPermissionState === HardwarePermissionStatus.granted
    ) {
      this.resetHardwareError('audio');
    }
  })

  _setPermissionError(error, kind) {
    // set permission state
    if (
      error.name === 'NotAllowedError'
      || error.name === 'PermissionDeniedError'
    ) {
      this[`${kind}PermissionState`] = HardwarePermissionStatus.denied;
      /**
     * If we don't have permissions to prompt user for permissions,
     * we can assume that the browser has already asked for permissions
     * and cannot prompt the user again. So we guide the user to
     * enable the permissions in the browser settings.
     */
      this._checkAndGuideUserForPermissions();
    } else {
      this[`${kind}PermissionState`] = HardwarePermissionStatus.granted;
    }
  }

  /**
   * Set default device id for audio/video devices.
   * Strategy:
   * 1. If user has selected a device in the settings, then use that device
   * 2. If user has a default device system wide, then use that device
   * 3. If user has no default device, then use the first available device
   */
  _setDefaultDevices() {
    // set default video device
    const userPrefVideoDeviceId = this._localStorage[lsItemKeys.videoDeviceId];
    const hasUserPrefVideoDeviceId = this.videoInputs.find(({ deviceId }) => (
      deviceId === userPrefVideoDeviceId
    ));

    if (userPrefVideoDeviceId && hasUserPrefVideoDeviceId) {
      this.videoDeviceId = this._localStorage[lsItemKeys.videoDeviceId];
    } else if (this.hasDefaultVideoInput) {
      this.videoDeviceId = 'default';
    } else if (this.videoInputs.length > 0) {
      const [defaultVideoInput] = this.videoInputs;
      this.videoDeviceId = defaultVideoInput.deviceId;
    } else {
      this.videoDeviceId = undefined;
    }

    // set default audio device
    const userAudioDeviceId = this._localStorage[lsItemKeys.audioDeviceId];
    const hasUserAudioDeviceId = this.audioInputs.find(({ deviceId }) => (
      deviceId === userAudioDeviceId
    ));

    if (userAudioDeviceId && hasUserAudioDeviceId) {
      this.audioDeviceId = this._localStorage[lsItemKeys.audioDeviceId];
    } else if (this.hasDefaultAudioInput) {
      this.audioDeviceId = 'default';
    } else if (this.audioInputs.length > 0) {
      const [defaultAudioInput] = this.audioInputs;
      this.audioDeviceId = defaultAudioInput.deviceId;
    } else {
      this.audioDeviceId = undefined;
    }

    // set default devices for audio/video in local storage
    this._localStorage[lsItemKeys.videoDeviceId] = this.videoDeviceId;
    this._localStorage[lsItemKeys.audioDeviceId] = this.audioDeviceId;
  }
}

const mediaStore = new MediaStore();

export default mediaStore;
