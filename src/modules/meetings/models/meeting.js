import {
  action, autorun, computed, flow, makeObservable, observable, override, runInAction,
} from 'mobx';
import camelCase from 'lodash/camelCase';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import upperFirst from 'lodash/upperFirst';
import debounce from 'lodash/debounce';

import { addBookmarkGTMEvent } from '~meetings/utils/gtm';
import { sendSubmitGTMEvent } from '@common/utils/gtm';
import {
  ACTIVE_PARTICIPANT_LIMIT,
  reactionNotificationStatus,
} from '~meetings/utils/messaging';
import {
  BROADCAST_ROLES,
  BroadcastSetupModes,
  getRoleLevel,
  ROLE_HIERARCHY,
} from '~meetings/utils/role';
import {
  canSetProxy,
  canTakeDoubts,
  meetingChannels,
} from '~meetings/utils/meeting';
import { enterFullscreen, exitFullscreen } from '@common/utils/browser';
import {
  getDeviceType,
  getRequestSource,
  isMobile,
  isScalerAndroidApp,
} from '@common/utils/platform';
import { isNullOrUndefined } from '@common/utils/type';
import { isPortrait } from '@common/utils/responsive';
import { JOIN_MODES, MEETING_ACTION_TRACKING } from '~meetings/utils/constants';
import { logEvent } from '@common/utils/logger';
import {
  MAX_QUESTION_LENGTH,
  MIN_QUESTION_LENGTH,
  QUESTION_RATE_LIMIT_TIMEOUT,
  QuestionFilter,
  QuestionSort,
  QuestionStatus,
} from '~meetings/utils/question';
import { PLAYLIST_CONTENT_SESSION_STATUS } from '~meetings/utils/playlist';
import { evaluateInWebview, notifyWebview } from '@common/utils/webview';
import { SCREEN_ORIENTATIONS } from '~meetings/utils/layout';
import { toast } from '@common/ui/general/Toast';
import bookmarksApi from '~meetings/api/bookmarks';
import ComposedVideoSession from './composedVideoSession';
import chatBotStreamApi from '~meetings/api/chatBotStream';
import ChatBotStreamManager from './chatBotStreamManager';
import layoutStore from '~meetings/stores/layoutStore';
import mediaStore from '~meetings/stores/mediaStore';
import MeetingBase from './meetingBase';
import meetingEvents from '~meetings/events';
import MeetingManager from './meetingManager';
import NoticeBoard from './noticeBoard';
import NoticeBoardV2 from './noticeBoardV2';
import meetingsApi from '~meetings/api/meetings';
import Messaging from './messaging';
import notesApi from '~meetings/api/notes';
import Playback from './playback';
import Playlist from './playlist';
import PlaylistPreloader from './playlistPreloader';
import ProxyChatMessage from './proxyChatMessage';
import ProxyQuestion from './proxyQuestion';
import Question from './question';
import questionsApi from '~meetings/api/questions';
import Recording from './recording';
import settingsStore from '~meetings/stores/settingsStore';
import VideoBroadcasting from './videoBroadcasting';
import Nudge from './nudge';
import PlaylistContentSession from './playlistContent/session';

const channelModelsMap = {
  video_broadcasting: VideoBroadcasting,
  messaging: Messaging,
};

// Time after which video call controls will be hidden
const CONTROLS_VISIBILITY_TIMEOUT = 1000; // In ms

const PARTICIPANT_SEARCH_DEBOUNCE = 360; // In ms

const PARTICIPANT_LIST_COMPUTATION_THROTTLE = 2000; // In ms

const deviceType = getDeviceType();
const devicePlatform = getRequestSource();

class Meeting extends MeetingBase {
  _controlsVisibilityTimeout = null;

  _manager = null;

  _noticeBoard = null;

  _messaging = null;

  _recording = null;

  _videoBroadcasting = null;

  areBookmarksLoaded = false;

  areQuestionsLoaded = false;

  questionRateLimitCountDown = null;

  isCreatingQuestion = false;

  isFullscreen = false;

  screenOrientation = (
    isPortrait()
      ? SCREEN_ORIENTATIONS.PORTRAIT
      : SCREEN_ORIENTATIONS.LANDSCAPE
  );

  isLoadingQuestions = false;

  isLoggingIn = false;

  loginError = false;

  /* Indicated if users is currently joined in the meeting */
  isJoined = false;

  _joinMode = 'normal';

  joinError = null;

  /**
   * Used for public meeting where user will select his role while joining
   * the meeting and authorize it by adding a valid password to unlock the role
   */
  isLoggedIn = false;

  participantSearchTerm = '';

  broadcastSetupMode = null;

  password = '';

  selectedRole = 'audience';

  isFeedbackSubmitted = false;

  joinWithAudio = true;

  joinWithVideo = true;

  endType = null;

  isMobilePanelExpanded = false;

  isChatInputVisible = false;

  isBookmarkModalOpen = false;

  questionInput = '';

  questionsLoadError = null;

  questions = observable.map({}, { deep: false });

  activeQuestionTab = 'active';

  activeNoticeBoardTab = 'general';

  activeQuestionSort = QuestionSort.votes;

  completedQuestionSort = QuestionSort.date;

  questionFilter = QuestionFilter.all;

  areControlsVisible = false;

  notes = '';

  isLoadingBookmarks = false;

  isNetworkRestricted = false;

  loadingBookmarksError = null;

  playback = null;

  isLoading = false;

  loadError = null;

  isSearchingParticipants = false;

  activeParticipants = [];

  bannedParticipants = [];

  allHosts = [];

  isLive = true;

  isGodMode = false;

  composedVideoSessions = observable.map({}, { deep: false });

  playlistPreloader = null;

  nudge = new Nudge();

  _aiSidekickVisible = null;

  _autoResponseEnabled = null;

  isAcknowledgingAiSidekickBanner = false;

  constructor(data) {
    super(data);

    this.activeTab = 'people';

    // Set default selected role as host for users who are already hosts
    if (this.roleLevel > 0) {
      this.setSelectedRole('host');
    }

    this._tryAndroidAutoLogin();
    makeObservable(this, {
      _aiSidekickVisible: observable,
      _autoResponseEnabled: observable,
      _joinMode: observable,
      _manager: observable.ref,
      _noticeBoard: observable.ref,
      _messaging: observable.ref,
      _needsRoleUpgrade: computed,
      _recording: observable,
      _videoBroadcasting: observable.ref,
      addOrUpdateComposedVideoSession: action,
      allBookmarks: computed,
      activeParticipants: observable.ref,
      activePeers: computed,
      activeQuestions: computed,
      activeQuestionSort: observable,
      activeQuestionTab: observable,
      activeNoticeBoardTab: observable,
      addOrUpdateQuestion: action.bound,
      allHosts: observable.ref,
      allowedRoles: computed,
      areBookmarksLoaded: observable,
      areControlsVisible: observable,
      areQuestionsLoaded: observable,
      bannedParticipants: observable.ref,
      canAskQuestion: computed,
      canBroadcast: computed,
      canControlPlaylist: computed,
      canSetProxy: computed,
      canLogin: computed,
      isCompanionModeAllowed: computed,
      isCompanionModeForced: computed,
      companionModeConfig: computed,
      channels: computed,
      chatBotStream: computed,
      completedQuestions: computed,
      completedQuestionSort: observable,
      manager: computed,
      end: action.bound,
      endType: observable,
      feedbackForms: computed,
      banner: computed,
      filteredParticipants: computed,
      filteredQuestions: computed,
      hasManyParticipants: computed,
      hasPlaylist: computed,
      isAdmin: computed,
      isAiSidekickVisible: computed,
      isAcknowledgingAiSidekickBanner: observable,
      isAudiencePasswordNeeded: computed,
      isAutoResponsesEnabled: computed,
      isBookmarkModalOpen: observable,
      isCreatingQuestion: observable,
      isChatInputVisible: observable,
      isFeedbackSubmitted: observable,
      isLoadingBookmarks: observable,
      isReactionNotificationEnabled: computed,
      isFullscreen: observable,
      isGodMode: observable,
      isHost: computed,
      isHostPasswordNeeded: computed,
      isJoined: observable,
      isLarge: computed,
      isLoading: observable,
      isLoadingQuestions: observable,
      isLoggedIn: observable,
      isLoggingIn: observable,
      isMobilePanelExpanded: observable,
      isNewScreenShareEnabled: computed,
      isProxyMessageEnabled: computed,
      isPublic: computed,
      isSearchingParticipants: observable,
      isStandaloneQuestionVsisble: computed,
      isValidQuestion: computed,
      joinError: observable.ref,
      joiningMode: computed,
      joinWithAudio: observable,
      joinWithVideo: observable,
      loadError: observable.ref,
      loginError: observable.ref,
      loadingBookmarksError: observable.ref,
      messaging: computed,
      namesFromAllHosts: computed,
      notes: observable,
      numActiveQuestions: computed,
      numBookmarks: override,
      noticeBoard: computed,
      nudge: observable.ref,
      onBroadcastSetupComplete: action.bound,
      participantSearchTerm: observable,
      playback: observable.ref,
      playlistPreloader: observable.ref,
      proxyChatMessage: computed,
      proxyQuestion: computed,
      needsTroubleshootingHelp: computed,
      broadcastSetupMode: observable,
      password: observable,
      questionFilter: observable,
      questionList: computed,
      questionSort: computed,
      questionRateLimitCountDown: observable,
      questionWithPendingInteraction: computed,
      recording: computed,
      removeComposedVideoSession: action,
      resetJoinMode: action.bound,
      selectedRole: observable,
      screenOrientation: observable,
      setActiveQuestionTab: action.bound,
      setActiveNoticeBoardTab: action.bound,
      setBookmarkModalOpen: action.bound,
      setControlsVisible: action,
      setChatInputVisible: action,
      setGodMode: action,
      setJoinMode: action.bound,
      setJoiningMode: action.bound,
      setNotesInput: action,
      setPassword: action.bound,
      setQuestionFilter: action,
      setQuestionInput: action,
      setQuestionSort: action,
      setQuestionRateLimit: action,
      setBroadcastSetupMode: action.bound,
      setFeedbackSubmitted: action.bound,
      setFullscreen: action.bound,
      setMobilePanelExpanded: action.bound,
      setSelectedRole: action.bound,
      setScreenOrientation: action.bound,
      shouldBroadcast: computed,
      shouldExpandMobilePanel: computed,
      sortedQuestions: computed,
      toggleFullscreen: action.bound,
      toggleScreenOrientation: action.bound,
      questionInput: observable,
      questionsLoadError: observable,
      videoBroadcasting: computed,
    });
  }

  /* Public methods */
  addBookmark = flow(function* () {
    if (
      this.isCreatingBookmark
      || !this.recording
      || !this.recording.isActive
    ) {
      return;
    }

    this.isCreatingBookmark = true;
    try {
      const json = yield bookmarksApi.createLive(
        this.slug,
        { title: this.bookmarkInput },
      );
      this._addBookmark(json.bookmark);
      addBookmarkGTMEvent(this.slug, this.bookmarkInput?.length, true);
      this.scrollToBookmarkSlug = json.bookmark.slug;
      this.isCreatingBookmark = false;
      this.setBookmarkInput('');
    } catch (error) {
      addBookmarkGTMEvent(this.slug, this.bookmarkInput?.length, false, 'error');
      this.isCreatingBookmark = false;
      throw error;
    }
  }).bind(this);

  trackEvent(eventName, attributes = {}) {
    const { sdk_version: sdkVersion } = this.config;
    const { standard_streaming: standardStreaming } = this.config;
    const { rtm_sdk_version: rtmSdkVersion } = this.config;
    super.trackEvent(
      eventName,
      {
        ...attributes,
        viewType: 'live',
        selectedRole: this.selectedRole,
        cloudProxyEnabled: settingsStore.cloudProxyEnabled,
        sdkVersion,
        rtmSdkVersion,
        standardStreaming,
        startTime: this.data.start_time,
        endTime: this.data.end_time,
        meetingName: this.data.name,
        deviceType,
        devicePlatform,
      },
    );
  }

  // disabling socket event tracking for now
  trackSocketEvent = () => null;

  loadBookmarks = flow(function* () {
    if (this.isLoadingBookmarks || this.areBookmarksLoaded) {
      return;
    }

    this.isLoadingBookmarks = true;
    this.loadingBookmarksError = null;

    try {
      const json = yield bookmarksApi.getLive(this.slug);
      this._createBookmarks(json.bookmarks);
      this.areBookmarksLoaded = true;
    } catch (error) {
      logEvent('error', 'ArchiveBookmarkError: Failed to load', error);
      this.loadingBookmarksError = error;
    }

    this.isLoadingBookmarks = false;
  });

  addOrUpdateComposedVideoSession(data) {
    let session;
    if (this.composedVideoSessions.has(data.id)) {
      session = this.composedVideoSessions.get(data.id);
      session.processUpdate(data);
    } else {
      session = new ComposedVideoSession(this, data);
      this.composedVideoSessions.set(data.id, session);
    }

    data.streams.forEach(
      stream => this.videoBroadcasting.addOrUpdateCDNStream(
        stream,
        session,
      ),
    );

    return session;
  }

  addOrUpdateQuestion(data) {
    let question;
    if (this.questions.has(data.id)) {
      question = this.questions.get(data.id);
      question.setData(data);
    } else {
      question = new Question(data.id, this, data);
      this.questions.set(data.id, question);
    }
    return question;
  }

  createQuestionGTMEvent = (status, message = 'success') => {
    sendSubmitGTMEvent('question', {
      lengthOfInput: this.questionInput.length,
      isStatus: true,
      action: 'input_submit',
      status,
      message,
      category: 'drona',
    });
  };

  createQuestion = flow(function* () {
    if (this.isCreatingQuestion || !this.isValidQuestion) return;

    this.isCreatingQuestion = true;
    try {
      const json = yield questionsApi.create(this.slug, this.questionInput);

      if (this.isAutoResponsesEnabled && this.chatBotStream.isConnected) {
        chatBotStreamApi.createChatResponseStream({
          questionText: this.questionInput,
          questionId: json.question_id,
        });
        this.chatBotStream.resetChat();
      }

      this.setQuestionRateLimit();
      const questionData = this._createNewQuestionPayload(
        json.question_id,
        this.questionInput,
      );
      this.messaging.sendEvent('new-question', {
        question: questionData,
        asker: this.currentParticipant.data,
      }, true);
      this.createQuestionGTMEvent(true);
      this.setQuestionInput('');
      this.setActiveQuestionTab('active');
      toast.show({
        message: 'Your question has been posted',
        type: 'info',
      });
    } catch (error) {
      let message = 'Failed to create question';
      if (
        error.isFromServer
        && error.response
        && error.response.status === 403
      ) {
        message = 'Wait for sometime before posting your next question';
      }
      toast.show({
        message,
        type: 'error',
      });
      this.createQuestionGTMEvent(false, message);
    }
    this.isCreatingQuestion = false;
  });

  destroy = flow(function* () {
    window.removeEventListener('unload', this._handleUnload);

    clearInterval(this._questionCooldownInterval);

    this.dispatchEvent(meetingEvents.LEFT_MEETING);
    this.track('left');

    if (this._participantListDisposer) {
      this._participantListDisposer();
      this._participantListDisposer = null;
    }

    this.recording.destroy();

    if (this.videoBroadcasting) {
      yield this.videoBroadcasting.destroy();
    }

    if (this.messaging) {
      yield this.messaging.destroy();
    }

    if (this.manager) {
      this.manager.destroy();
    }

    if (this.playback) {
      this.playback.destroy();
    }

    this.composedVideoSessions.forEach(session => session.destroy());
    this.composedVideoSessions.clear();

    // Exit fullscreen if was in fullscreen mode
    exitFullscreen();
    this.isJoined = false;
  });

  end(type = 'manual') {
    this.endType = type;
    this.dispatchEvent(meetingEvents.MEETING_ENDED, { endType: type });
  }

  findOrCreateParticipant(userId, refresh = false) {
    const participant = super.findOrCreateParticipant(userId);
    if (this.messaging && refresh) {
      this.messaging.refreshParticipant(participant);
    }
    return participant;
  }

  getComposedVideoSession(sessionId) {
    return this.composedVideoSessions.get(sessionId);
  }

  getQuestion(questionId) {
    const question = this.questions.get(questionId);
    return question;
  }

  initialise = async () => {
    if (this.isJoined || this.isLoading) return;

    this._addParticipantListSideEffect();
    this.dispatchEvent(meetingEvents.JOINED_MEETING);
    this.track('joined');
    this.loadSession();
    this.manager.subscribeToSocketIfNeeded();
    window.addEventListener('unload', this._handleUnload);
  };

  loadSession = flow(function* () {
    if (this.isJoined || this.isLoading) return;

    this.isLoading = true;
    this.loadError = null;

    try {
      const json = yield meetingsApi.getSession(
        this.slug,
        settingsStore.cloudProxyEnabled,
      );
      this._tokens = json.tokens;
      this._createParticipants(json.participants);
      this._createNoticeBoard(json);
      this._setSessionData(json.data);
      this._setDefaultActiveTab();
      this._createProxyChatMessage();
      this._createProxyQuestion();
      this._join();
      this.isJoined = true;
      this.trackEvent(
        MEETING_ACTION_TRACKING.meetingJoined,
      );
    } catch (error) {
      this.loadError = error;
      logEvent('error', 'SessionLoadError: Failed to load session', error);
      this.trackEvent(
        MEETING_ACTION_TRACKING.meetingJoinFailed,
        {
          hasError: true,
          errorMessage: error?.message
            || 'SessionLoadError: Failed to load session',
          error,
        },
      );
    }
    this.isLoading = false;
  });

  login = flow(function* (mode = 'normal') {
    this.setJoiningMode(mode);
    if (this._needsRoleUpgrade) {
      this.isLoggingIn = true;
      this.loginError = null;

      try {
        const json = yield meetingsApi.createParticipant(
          this.slug,
          this.selectedRole,
          this.password,
        );
        const data = { ...this.data };
        data.participant = json.participant;
        this._data = data;
        this.markLoggedIn();
      } catch (error) {
        this.loginError = error;
        logEvent('error', 'LoginError: Failed to login', error);
      }

      this.isLoggingIn = false;
    } else {
      try {
        this.markLoggedIn();
      } catch (error) {
        this.loginError = error;
        logEvent('error', 'LoginError: markLoggedIn failed', error);
      }
    }
  });

  loadQuestions = flow(function* () {
    if (this.isLoadingQuestions || this.areQuestionsLoaded) return;

    this.isLoadingQuestions = true;
    this.questionsLoadError = null;

    try {
      const json = yield questionsApi.getList(this.slug);
      this.updateParticipants(json.askers);
      json.questions.forEach(this.addOrUpdateQuestion);
      this.areQuestionsLoaded = true;
    } catch (error) {
      this.questionsLoadError = error;
      logEvent('error', 'Failed to load questions', error);
    }

    this.isLoadingQuestions = false;
  });

  markLoggedIn() {
    const participant = this.data.participant || {};
    this._manager = new MeetingManager(
      this,
      {
        isTemporaryHost: participant.is_unmuted,
        doubtSessionStarted: !isNullOrUndefined(this.data.pseudo_end_time),
        isChatDisabled: participant.is_chat_disabled,
      },
    );
    this._chatBotStream = null;

    // Connect only if auto responses are enabled
    // Super hosts need not connect to chat bot stream
    if (this.isAutoResponsesEnabled && !this.isSuperHost) {
      this._chatBotStream = new ChatBotStreamManager(this);
    }
    this.isLoggedIn = true;
  }

  onBroadcastSetupComplete = () => {
    switch (this.broadcastSetupMode) {
      case BroadcastSetupModes.host:
        this.setSelectedRole('host');
        break;
      case BroadcastSetupModes.audience:
        this.videoBroadcasting.updateToken(this.manager.temporaryHostToken);
        // If messaging is available then send current user info to all other
        // users in channel so that they can see name of the user on the stream
        if (this.messaging) {
          this.messaging.sendMyData();
        }
        this.setSelectedRole('host');
        break;
      default:
        throw new Error('Invalid permission mode');
    }

    this.setBroadcastSetupMode(null);
  };

  processComposedVideoSession(data) {
    if (['ended', 'failed'].includes(data.status)) {
      this.removeComposedVideoSession(data.id);
    } else {
      this.addOrUpdateComposedVideoSession(data);
    }

    if (this.playlist) {
      const session = this.playlist.sessions.get(data.id);

      if (data.status === PLAYLIST_CONTENT_SESSION_STATUS.failed) {
        toast.show({
          message: 'Video stopped unexpectedly. Try again after 30 seconds',
          type: 'error',
        });
      }

      if (session) {
        session.updateStatus(data.status);
      }
    }
  }

  processCueCardUpdate(data) {
    if (this.playlist) {
      const session = this.playlist.sessions.get(data.id);

      if (session) {
        session.updateStatus(data.status);
        switch (data.status) {
          case PLAYLIST_CONTENT_SESSION_STATUS.playing:
            session.updateData({
              started_at: data.started_at,
            });
            break;
          case PLAYLIST_CONTENT_SESSION_STATUS.ended:
            session.updateData({
              ended_at: data.ended_at,
            });
            break;
          default:
            break;
        }
      } else {
        // creates new session if session is not present
        // this will help creating session for audience as load session
        // is not called for audience after every start/update call
        const newSession = new PlaylistContentSession(this.playlist, data);
        this.playlist.sessions.set(data.id, newSession);
      }
    }
  }

  removeComposedVideoSession(sessionId) {
    const session = this.getComposedVideoSession(sessionId);
    if (session) {
      // Destroy individual streams first
      session.streamIds.forEach(
        streamId => this.videoBroadcasting.removeStream(streamId),
      );

      // Then the session itself
      session.destroy();
      this.composedVideoSessions.delete(sessionId);
    }
  }

  resetJoinMode() {
    this.joinWithAudio = true;
    this.joinWithVideo = true;
  }

  searchParticipants = debounce(flow(function* () {
    this.isSearchingParticipants = true;
    try {
      const json = yield meetingsApi.findParticipants(
        this.slug,
        this.participantSearchTerm,
      );
      this.updateParticipants(json.participants);
    } finally {
      this.isSearchingParticipants = false;
    }
  }), PARTICIPANT_SEARCH_DEBOUNCE);

  saveNotes() {
    notesApi.update(this.slug, this.notes);
  }

  setActiveQuestionTab(name) {
    this.activeQuestionTab = name;
  }

  setActiveNoticeBoardTab(name) {
    this.activeNoticeBoardTab = name;
  }

  setBanned(isBanned) {
    this.isBanned = isBanned;
  }

  setBookmarkModalOpen(isOpen) {
    this.isBookmarkModalOpen = isOpen;
  }

  setControlsVisible(isVisible, autoHide = true) {
    clearTimeout(this._controlsVisibilityTimeout);
    this.areControlsVisible = isVisible;
    if (isVisible && autoHide) {
      this._controlsVisibilityTimeout = setTimeout(() => {
        this.setControlsVisible(false);
      }, CONTROLS_VISIBILITY_TIMEOUT);
    }
  }

  setFeedbackSubmitted(isSubmitted) {
    this.isFeedbackSubmitted = isSubmitted;
  }

  setGodMode(isGod) {
    this.isGodMode = isGod;
  }

  setJoinMode(device, isEnabled) {
    this[`joinWith${upperFirst(device)}`] = isEnabled;
  }

  setParticipantSearchTerm(searchTerm) {
    this.participantSearchTerm = searchTerm;
    if (searchTerm.length > 2) {
      this.searchParticipants();
    }
  }

  setPassword(password) {
    this.password = password;
  }

  setBroadcastSetupMode(mode) {
    this.broadcastSetupMode = mode;
  }

  setFullscreen(isFullscreen) {
    this.isFullscreen = isFullscreen;
  }

  setScreenOrientation(screenOrientation) {
    this.screenOrientation = screenOrientation;
  }

  setMobilePanelExpanded(isExpanded) {
    this.isMobilePanelExpanded = isExpanded;
  }

  setChatInputVisible(isVisible) {
    this.isChatInputVisible = isVisible;
  }

  setNotes() {
    if (this.hasNotes) {
      this.setNotesInput(this.resources.note.content);
    }
  }

  setAiSidekickDisabled() {
    this._aiSidekickVisible = false;
  }

  setAutoResponsesEnabled(isEnabled) {
    this._autoResponseEnabled = isEnabled;
  }

  setJoiningMode(mode) {
    this._joinMode = JOIN_MODES[mode];
  }

  setNotesInput(value) {
    this.notes = value;
  }

  setSelectedRole(role) {
    this.selectedRole = role;
  }

  setQuestionFilter(filter) {
    this.questionFilter = filter;
  }

  setQuestionInput(value) {
    this.questionInput = value;
  }

  setQuestionRateLimit() {
    this.questionRateLimitCountDown = QUESTION_RATE_LIMIT_TIMEOUT;
    this._questionCooldownInterval = setInterval(() => {
      runInAction(() => {
        this.questionRateLimitCountDown -= 1;
        if (this.questionRateLimitCountDown <= 0) {
          clearInterval(this._questionCooldownInterval);
          this.questionRateLimitCountDown = null;
        }
      });
    }, 1000);
  }

  setQuestionSort(sort) {
    if (this.activeQuestionTab === 'active') {
      this.activeQuestionSort = sort;
    } else {
      this.completedQuestionSort = sort;
    }
  }

  setIsNetworkRestricted(isNetworkRestricted) {
    this.isNetworkRestricted = isNetworkRestricted;
    if (this.messaging.loadError) {
      this.messaging.join();
    }
  }

  toggleFullscreen() {
    if (layoutStore.isStandalone) {
      if (this.isFullscreen) {
        exitFullscreen();
      } else {
        enterFullscreen();
      }
    }

    this.isFullscreen = !this.isFullscreen;
  }

  toggleScreenOrientation() {
    if (this.screenOrientation === SCREEN_ORIENTATIONS.LANDSCAPE) {
      this.screenOrientation = SCREEN_ORIENTATIONS.PORTRAIT;
    } else {
      this.screenOrientation = SCREEN_ORIENTATIONS.LANDSCAPE;
    }
    if (evaluateInWebview('canRotateScreen')) {
      notifyWebview('rotateScreen');
    }
  }

  reload = () => {
    window.location.reload();
  };

  updateOnlineParticipants(userIds) {
    const newOnlineUserIds = userIds.map(o => String(o));
    const oldOnlineUserIds = [];

    this.participants.forEach(participant => {
      if (participant.isActive) {
        oldOnlineUserIds.push(participant.userId);
      }
    });

    const idsToMarkOffline = difference(oldOnlineUserIds, newOnlineUserIds);
    const idsToMarkOnline = difference(newOnlineUserIds, oldOnlineUserIds);

    idsToMarkOffline.forEach(userId => {
      const participant = this.findOrCreateParticipant(userId);
      participant.setActive(false);
    });

    idsToMarkOnline.forEach(userId => {
      const participant = this.findOrCreateParticipant(userId, true);
      participant.setActive(true);
    });
  }

  acknowledgeAiSidekickBanner = flow(function* () {
    this.isAcknowledgingAiSidekickBanner = true;
    try {
      yield meetingsApi.acknowledgeAiSidekickBanner(this.slug);
      this.setAiSidekickDisabled();
    } catch {
      toast.show({
        message: 'Failed to acknowledge the AI sidekick banner',
        type: 'error',
      });
    }
    this.isAcknowledgingAiSidekickBanner = false;
  });

  /**
   * List of active pariticipants other than current user
   */
  get activePeers() {
    return this.activeParticipants.slice(1);
  }

  get activeQuestions() {
    return this.questionList.filter(o => !o.isCompleted && !o.shouldHide);
  }

  get allBookmarks() {
    return orderBy(
      Object.values(this._allBookmarks),
      o => o.created_at,
      'desc',
    );
  }

  get allowedRoles() {
    if (
      (this.isPublic && !this.isLoggedIn)
      || this.roleLevel > 0
    ) {
      if (this.isInteractive) {
        return ['host'];
      } else {
        return ['audience', 'host'];
      }
    } else {
      return ['audience'];
    }
  }

  get canBroadcast() {
    return BROADCAST_ROLES.includes(this.user.role);
  }

  get canLogin() {
    if (this.selectedRole === 'audience') {
      return true;
    } else if (mediaStore.enabledAVStreamsLoading) {
      return false;
    } else if (mediaStore.hasPermissions) {
      // if user is host and is interactive (minimum mic permissions)
      // then they can login, this happens when user has mic permissions
      // but mic failed to start
      return mediaStore.hasMinimumHostAVRequirements;
    } else {
      return false;
    }
  }

  /*
    Without companion bypass
      Join Flow     Companion Mode   Show
      Disable       Allow             C
      Disable       Disable           not possible
      Enable        Allow             J+C
      Enable        Disable           J
    With companion bypass
      Join Flow     Companion Mode   Show
      Disable       Allow             not possible
      Disable       Disable           not possible
      Enable        Allow             J
      Enable        Disable           J
  */

  get isCompanionModeForced() {
    return !this.companionModeConfig.bypass
      && this.companionModeConfig?.force === true;
  }

  get isCompanionModeAllowed() {
    return !this.companionModeConfig.bypass
      && this.companionModeConfig?.allowed === true;
  }

  get joiningMode() {
    if (this.isCompanionModeForced) {
      return JOIN_MODES.companion;
    } else {
      return this._joinMode;
    }
  }

  get canAskQuestion() {
    return !this.questionRateLimitCountDown;
  }

  get questionWithPendingInteraction() {
    if (!this.isAutoResponsesEnabled) {
      return null;
    } else {
      return this.questionList.filter(
        question => question.isUserInteractionWithResponsePending,
      )[0];
    }
  }

  get isStandaloneQuestionVsisble() {
    return this.questionWithPendingInteraction
      && this.activeQuestionTab === 'active';
  }

  get canControlPlaylist() {
    return this.isSuperHost && Boolean(this.resources.playlist);
  }

  get canSetProxy() {
    return canSetProxy(this.type) && !isMobile();
  }

  // Any user other than audience can switch roles
  get canSwitchRole() {
    return this.roleLevel > 0;
  }

  get channels() {
    return meetingChannels(this.type);
  }

  get completedQuestions() {
    return this.questionList.filter(o => o.isCompleted && !o.shouldHide);
  }

  get doubtSessionAllowed() {
    return canTakeDoubts(this.type);
  }

  get companionModeConfig() {
    return this.data.companion_mode_config;
  }

  get resolutionConfig() {
    return this.data.live_config;
  }

  get feedbackForms() {
    return this.data.feedback_forms;
  }

  get banner() {
    return this.data.banner;
  }

  get filteredParticipants() {
    if (this.participantSearchTerm) {
      return this.activeParticipants
        .filter(participant => participant.name.toLowerCase()
          .includes(this.participantSearchTerm.toLowerCase()));
    }
    return this.activeParticipants;
  }

  get filteredQuestions() {
    let list = this.activeQuestionTab === 'active'
      ? this.activeQuestions
      : this.completedQuestions;

    if (this.questionFilter === QuestionFilter.mine) {
      list = list.filter(o => o.isMine);
    }

    return list;
  }

  get hasNotes() {
    return !isEmpty(this.resources.note);
  }

  get hasExternalLinks() {
    return this.resources.external_link?.links?.length > 0;
  }

  get hasManyParticipants() {
    return this.participants.size >= ACTIVE_PARTICIPANT_LIMIT;
  }

  get hasBanner() {
    return !isEmpty(this.data.banner);
  }

  get hasPlaylist() {
    return this.data.has_playlist;
  }

  get isAdmin() {
    return this.user.admin;
  }

  /**
   * Indicates if user needs to add password before joining the meeting as
   * audience
   */
  get isAudiencePasswordNeeded() {
    return (
      this.isPublic
      && this.data.audience_password
      && this.roleLevel < 0
    );
  }

  get isHost() {
    return this.roleLevel > 0;
  }

  /**
   * Indicates if user needs to add password before joining the meeting as
   * host
   */
  get isHostPasswordNeeded() {
    return (
      this.isPublic
      && this.roleLevel < 1
    );
  }

  get isInteractive() {
    return ['interaction', 'timed_interaction'].includes(this.type);
  }

  get isLarge() {
    return Boolean(this.data.large);
  }

  get isPublic() {
    return this.data.acl === 'open_to_all';
  }

  get isValidQuestion() {
    const length = this.questionInput ? this.questionInput.trim().length : 0;
    return length >= MIN_QUESTION_LENGTH && length <= MAX_QUESTION_LENGTH;
  }

  get roleLevel() {
    return getRoleLevel(this.user.role);
  }

  get manager() {
    return this._manager;
  }

  get chatBotStream() {
    return this._chatBotStream;
  }

  get noticeBoard() {
    return this._noticeBoard;
  }

  get messaging() {
    return this._messaging;
  }

  get numActiveQuestions() {
    if (!this.areQuestionsLoaded) {
      return Math.max(
        this.data.active_question_count || 0,
        this.activeQuestions.length,
      );
    } else {
      return this.activeQuestions.length;
    }
  }

  get isAutoResponsesEnabled() {
    if (this._autoResponseEnabled === null) {
      return !!this.data.auto_responses_enabled;
    }

    return this._autoResponseEnabled;
  }

  get isAiSidekickVisible() {
    if (this._aiSidekickVisible === null) {
      return this.data.show_new_badge_for_auto_responses || false;
    }
    return this._aiSidekickVisible;
  }

  get isNewScreenShareEnabled() {
    return this.data.new_screen_share_enabled || false;
  }

  get isProxyMessageEnabled() {
    return this.data.proxy_messages_enabled || false;
  }

  get numBookmarks() {
    if (this.areBookmarksLoaded) {
      return Object.keys(this._allBookmarks).length;
    } else {
      return this.data.num_bookmarks;
    }
  }

  get proxyChatMessage() {
    return this._proxyChatMessage;
  }

  get proxyQuestion() {
    return this._proxyQuestion;
  }

  get questionList() {
    const list = [];
    this.questions.forEach(question => {
      if (!question.isDeleted) {
        list.push(question);
      }
    });

    return orderBy(list, ['id'], ['desc']);
  }

  get questionSort() {
    if (this.activeQuestionTab === 'active') {
      return this.activeQuestionSort;
    } else {
      return this.completedQuestionSort;
    }
  }

  get recording() {
    return this._recording;
  }

  get shouldBroadcast() {
    return BROADCAST_ROLES.includes(this.selectedRole);
  }

  get isLiveLecture() {
    return this.type === 'lecture_hall';
  }

  get canSeeParticipantCount() {
    return !this.isLiveLecture && !this.showParticipantList;
  }

  get showParticipantList() {
    if (this.isLiveLecture) {
      return this.isGodMode || this.isHost;
    } else {
      return this.isSuperHost || !this.isLarge;
    }
  }

  get sortedQuestions() {
    let sortProperty = 'numVotes';
    if (this.questionSort === QuestionSort.date) {
      sortProperty = this.activeQuestionTab === 'active'
        ? 'askedAt'
        : 'answeredAt';
    }

    return orderBy(
      this.filteredQuestions,
      ['isOngoing', sortProperty],
      ['desc', 'desc'],
    );
  }

  get messages() {
    return this.messaging.messages;
  }

  get needsTroubleshootingHelp() {
    return (
      this.videoBroadcasting.hasTimeoutError
      || this.videoBroadcasting.streamStartError
      || mediaStore.hasAudioHardwareError
      || mediaStore.hasVideoHardwareError
    );
  }

  get shouldExpandMobilePanel() {
    return (
      this.isMobilePanelExpanded
      || (this.messaging && (
        this.messaging.isTyping
        || this.messaging.isPickingEmoji
      ))
    );
  }

  get videoBroadcasting() {
    return this._videoBroadcasting;
  }

  get namesFromAllHosts() {
    return this.allHosts.map(i => i.name);
  }

  get isReactionNotificationEnabled() {
    const floatingReactionsEnabled = window.__MEETING_CONFIG__
      ?.settings
      ?.general
      ?.floating_reactions;

    return (
      !this.isGhost
      && floatingReactionsEnabled
      && (
        settingsStore.reactionNotificationEnabled
        === reactionNotificationStatus.enabled
      )
      && this.messaging
      && this.messaging.reactions
      && this.messaging.reactions.responses
    );
  }

  /* Private methods */

  _addParticipantListSideEffect() {
    if (this._participantListDisposer) {
      this._participantListDisposer();
    }

    // `activeParticipants`, `allHosts` and `bannedParticipants` are not
    // created as computed because for large meetings the list of participants
    // can be huge and computation will be expensive, as an optimisation we
    // are throttling their computation using autorun as the same is not
    // possible when using computeds
    this._participantListDisposer = autorun(() => {
      const activeParticipants = [];
      const allHosts = [];
      const bannedParticipants = [];

      this.participants.forEach(participant => {
        if (participant.isBot) {
          return;
        }

        if (
          participant.isGhost
          && !(
            participant.isCurrentUser
            || this.isSuperHost
          )
        ) {
          // Show assisted live recording user in chat list
          participant.setActive(true);
          allHosts.push(participant);
        }

        if (participant.isBanned) {
          bannedParticipants.push(participant);
          return;
        }

        if (participant.isHost) {
          allHosts.push(participant);
        }

        if (
          (participant.isActive || participant.isGhost)
          || participant.isUnmuted
          || participant.isHandRaised
          || participant.isCurrentUser
        ) {
          activeParticipants.push(participant);
        }
      });

      runInAction(() => {
        this.activeParticipants = orderBy(
          activeParticipants,
          [
            'isCurrentUser', 'isHost', 'isUnmuted', 'isHandRaised', 'isLoaded',
            'name',
          ],
          ['desc', 'desc', 'desc', 'desc', 'desc', 'asc'],
        );

        this.allHosts = orderBy(
          allHosts,
          ['isCurrentUser', 'name'],
          ['desc', 'asc'],
        );

        this.bannedParticipants = orderBy(bannedParticipants, 'name', 'asc');
      });
    }, { delay: PARTICIPANT_LIST_COMPUTATION_THROTTLE });
  }

  _createNewQuestionPayload(id, body) {
    return {
      id,
      body,
      created_at: new Date(),
      updated_at: new Date(),
      asker_id: this.userId,
      status: QuestionStatus.pending,
      response: null,
      responder_type: (
        this.isAutoResponsesEnabled
        && this.chatBotStream.isConnected
      ) ? 'bot' : 'manual',
      upvoters: [],
    };
  }

  _handleUnload = () => {
    this.destroy();
  };

  _initialiseChannels() {
    this.channels.forEach(channel => {
      const channelKey = `_${camelCase(channel)}`;
      if (this[channelKey]) {
        this[channelKey].join();
      } else {
        const Channel = channelModelsMap[channel];
        this[channelKey] = new Channel(
          this,
          this.data.provider,
          this._tokens[channel],
        );
        this[channelKey].initialise(this.joiningMode);
      }
    });
  }

  _initialisePlayback() {
    this.playback = new Playback(this);
  }

  _initialisePlaylistPreloader() {
    if (this.hasPlaylist) {
      this.playlistPreloader = new PlaylistPreloader(this);
    }
  }

  _initialiseRecording() {
    this._recording = new Recording(this, this.data.recording);
  }

  _join() {
    this._initialiseChannels();
    this._initialisePlayback();
    this._initialiseRecording();
    this._initialisePlaylistPreloader();
  }

  _setDefaultActiveTab() {
    // If people list is disabled then show chat by default
    if (!this.showParticipantList) {
      this.setActiveTab('chat');
    }
  }

  _setSessionData(data) {
    this._data = {
      ...this.data,
      ...data,
    };
    this.setNotes();
    this.manager.setOnlineUserCount(data.online_user_count);
    this.manager.setSettings(data.settings);
    this.manager.setMyLeaderboardEntry(data.position);
    this._setPlaylist(data.resources.playlist);
    if (data.online_user_ids) {
      this.updateOnlineParticipants(data.online_user_ids);
    }
  }

  _createNoticeBoard(data) {
    if (this.config?.newNoticeBoardEnabled) {
      this._noticeBoard = new NoticeBoardV2(this, { messages: data.notice_board });
    } else {
      this._noticeBoard = new NoticeBoard(this, { messages: data.pinned });
    }
  }

  _createProxyChatMessage() {
    this._proxyChatMessage = new ProxyChatMessage(this);
  }

  _createProxyQuestion() {
    this._proxyQuestion = new ProxyQuestion(this);
  }

  _setPlaylist(playlist) {
    if (playlist) {
      // assumption -> only one playlist currently
      const [playlistItem] = playlist.items;
      this.playlist = new Playlist(this, playlistItem?.id);
    }
  }

  _tryAndroidAutoLogin() {
    const autoLogin = (
      isScalerAndroidApp()
      && this.canLogin
      && this.user?.role === 'audience'
      && this.allowedRoles?.length <= 1
    );

    if (autoLogin) {
      this.login();
    }
  }

  /**
   * Indicates if user is trying join with a role which is superior to his
   * current role
   */
  get _needsRoleUpgrade() {
    const requestedRoleLevel = ROLE_HIERARCHY.indexOf(this.selectedRole);
    return requestedRoleLevel > this.roleLevel;
  }
}

export default Meeting;
