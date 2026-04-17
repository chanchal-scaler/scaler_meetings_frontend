import {
  action, computed, flow, makeObservable, observable, reaction,
} from 'mobx';
import camelCase from 'lodash/camelCase';

import { BroadcastSetupModes } from '~meetings/utils/role';
import { DUMMY_QUIZ, transformQuizData } from '~meetings/utils/quiz';
import {
  HAND_RAISE_TIMEOUT,
} from '~meetings/utils/constants';
import { isNullOrUndefined } from '@common/utils/type';
import { logEvent } from '@common/utils/logger';
import { snackbar } from '@common/ui/general/Snackbar';
import { SocketStatus } from '~meetings/utils/meeting';
import { toast } from '@common/ui/general/Toast';
import { wait } from '@common/utils/async';
import AudioNotification from '@common/lib/audioNotification';
import dateApi from '@common/api/date';
import LiveQuiz from './liveQuiz';
import meetingEvents from '~meetings/events';
import Poll from './poll';
import Survey from './survey';
import Socket from '@common/lib/socket';
import TextMessage from './textMessage';

const alertNotification = new AudioNotification('alert');
const infoNotification = new AudioNotification('info');

const SOCKET_EVENTS = [
  'connecting', 'connected', 'disconnected', 'rejected', 'error',
  'hand_raised', 'muted', 'unmuted', 'ban_toggled', 'participant_changed',
  'setting_changed', 'recording_updated', 'meeting_ended', 'quiz_published',
  'leaderboard_updated', 'dummy_quiz', 'poll_published', 'force_rejected',
  'online_user_count', 'online_users', 'new_question', 'question_status_change',
  'question_vote', 'doubt_session_started', 'chat_enabled', 'chat_disabled',
  'playlist_content_session_updated', 'nudge', 'survey_published',
  'playlist_content_session_status_updated',
  'question_bot_response_ack_by_asker',
  'question_bot_response_approved_by_host',
  'question_bot_response_rejected_by_host',
  'disable_auto_responses',
  'new_proxy_message', 'remove_nudge',
  'sync_proxy_upvotes',
];

// We are not tracking all socket events as it would drastically increase
// number of events tracked on mixpanel.
const SOCKET_EVENTS_TO_TRACK = [
  'quiz_published', 'dummy_quiz', 'poll_published',
  'playlist_content_session_updated',
];

const ActionTypes = {
  changeSetting: 'change_setting',
  unmuteAudience: 'unmute_audience',
  muteAudience: 'mute_audience',
  raiseHand: 'raise_hand',
  text: 'text',
  deleteMessage: 'delete_message',
  endMeeting: 'end_meeting',
  toggleBan: 'toggle_ban',
  fetchLeaderboard: 'fetch_leaderboard',
  launchDummyQuiz: 'launch_dummy_quiz',
  publishPoll: 'publish_poll',
  publishSurvey: 'publish_survey',
  publishQuiz: 'publish_quiz',
  reaction: 'reaction',
  startDoubtSession: 'start_doubt_session',
  loadRecordingStatus: 'fetch_recording_status',
  disableChat: 'disable_chat',
  enableChat: 'enable_chat',
  updateRecordedStream: 'update_recorded_stream',
  fetchPlaylistSessionStatus: 'fetch_playlist_content_session_status',
  sendNudgeAcknowledgement: 'nudge_acknowledgement',
};

const recordingErrorStatuses = ['cancelled', 'failed'];

// Notify server every 30 seconds of the clients presence
const PONG_INTERVAL = 30 * 1000;

class MeetingManager {
  isConnected = false;

  status = SocketStatus.waiting;

  isRaisingHand = false;

  raiseHandError = null;

  settings = {};

  isHandRaised = false;

  isTemporaryHost = false;

  isChatDisabled = false;

  temporaryHostToken = null;

  quiz = null;

  leaderboard = [];

  myLeaderboardEntry = {};

  isLeaderboardOpen = false;

  isPlatformFeedbackOpen = false;

  numProblems = 0;

  poll = null;

  survey = null;

  connectionId = null;

  onlineUserCount = 0;

  doubtSessionStarted = false;

  constructor(meeting, initialState) {
    this._meeting = meeting;

    this._initialise(initialState);
    this._addUnmuteReaction();
    makeObservable(this, {
      activeScreenUserId: computed,
      dropPoll: action.bound,
      dropSurvey: action.bound,
      dropQuiz: action.bound,
      isHandRaised: observable,
      isLeaderboardOpen: observable,
      isPlatformFeedbackOpen: observable,
      isRaisingHand: observable,
      isRaiseHandDisabled: computed,
      isQuestionsDisabled: computed,
      isTemporaryHost: observable,
      isChatDisabled: observable,
      launchPoll: action.bound,
      launchSurvey: action.bound,
      launchQuiz: action.bound,
      leaderboard: observable.ref,
      load: action.bound,
      meeting: computed,
      myLeaderboardEntry: observable.ref,
      numProblems: observable,
      onlineUserCount: observable,
      poll: observable.ref,
      survey: observable.ref,
      quiz: observable.ref,
      raiseHandError: observable.ref,
      setLeaderboard: action.bound,
      setLeaderboardOpen: action.bound,
      setPlatformFeedbackOpen: action.bound,
      setOnlineUserCount: action.bound,
      setSettings: action.bound,
      setStatus: action.bound,
      setTemporaryHost: action.bound,
      setChatDisabled: action.bound,
      settings: observable.ref,
      status: observable,
      doubtSessionStarted: observable,
    });
  }

  /* Public */

  destroy() {
    clearInterval(this._connectionAliveNotifier);
    clearTimeout(this._leaderboardCloseTimeout);
    if (this._unmuteReaction) {
      this._unmuteReaction();
    }

    this._removeEventListeners();
    this.dropPoll();
    this.dropSurvey();
    this.dropQuiz();
    this.socket.destroy();
  }

  dropPoll() {
    if (this.poll) {
      this.poll.destroy();
      this.poll = null;
    }
  }

  dropSurvey() {
    if (this.survey) {
      this.survey.destroy();
      this.survey = null;
    }
  }

  dropQuiz() {
    if (this.quiz) {
      this.quiz.destroy();
      this.quiz = null;
    }
  }

  publishRecentPoll = flow(function* (newPollId) {
    if (!this.poll || this.poll.id !== newPollId || !this.meeting.isSuperHost) {
      return;
    }
    try {
      const pollId = this.poll.id;
      yield this.socket.sendAsync(
        ActionTypes.publishPoll,
        {
          poll_id: pollId,
        },
      );
    } catch (error) {
      toast.show({
        message: 'Failed to republish poll',
        type: 'error',
      });
      logEvent('error', 'SocketError: Failed to republish poll', error);
    }
  });

  publishRecentSurvey = flow(function* (newSurveyId) {
    if (
      !this.survey
      || this.survey.id !== newSurveyId
      || !this.meeting.isSuperHost
    ) {
      return;
    }
    try {
      const surveyId = this.survey.id;
      yield this.socket.sendAsync(
        ActionTypes.publishSurvey,
        {
          survey_id: surveyId,
        },
      );
    } catch (error) {
      toast.show({
        message: 'Failed to republish survey',
        type: 'error',
      });
      logEvent('error', 'SocketError: Failed to republish survey', error);
    }
  });

  publishRecentQuiz = flow(function* (newQuizId) {
    if (!this.quiz || this.quiz.id !== newQuizId || !this.meeting.isSuperHost) {
      return;
    }
    try {
      const quizId = this.quiz.id;
      yield this.socket.sendAsync(
        ActionTypes.publishQuiz,
        {
          quiz_id: quizId,
        },
      );
    } catch (error) {
      toast.show({
        message: 'Failed to republish quiz',
        type: 'error',
      });
      logEvent('error', 'SocketError: Failed to republish quiz', error);
    }
  });

  sendNudgeAcknowledgement = flow(function* (chatMessageId) {
    if (!chatMessageId) {
      return;
    }

    try {
      yield this.socket.sendAsync(
        ActionTypes.sendNudgeAcknowledgement,
        {
          chat_message_id: chatMessageId,
        },
      );
    } catch (error) {
      logEvent(
        'error',
        'SocketError: Failed to send nudge acknowledgement',
        error,
      );
    }
  });

  launchPoll(data, publisherId) {
    // Don't do anything if the same poll is already in progress
    // will skip since already same poll in progress
    if (this.poll && this.poll.id === data.id) {
      return;
    }

    // Drop any existing poll. Currently we only allow one poll at a time
    this.dropPoll();

    infoNotification.play();

    this.meeting.setActiveTab('chat');
    this.meeting.setMobilePanelExpanded(true);
    this.poll = new Poll(data, this, publisherId);
    this.poll.start();

    if (!this.meeting.isSuperHost) {
      toast.show({ message: 'Host has launched a poll!' });
    }
  }

  launchSurvey(data, publisherId) {
    if (this.survey && this.survey.id === data.id) {
      return;
    }

    // Drop any existing survey. Currently we only allow one survey at a time
    this.dropSurvey();

    infoNotification.play();

    this.meeting.setActiveTab('chat');
    this.meeting.setMobilePanelExpanded(true);
    this.survey = new Survey(data, this, publisherId);
    this.survey.start();

    if (!this.meeting.isSuperHost) {
      toast.show({ message: 'Host has launched a survey!' });
    }
  }

  launchQuiz(data, isDummy = false) {
    // Don't do anything if the same quiz is already in progress
    // will skip since already same quiz in progress
    if (this.quiz && this.quiz.id === data.id) {
      return;
    }

    // Drop if there is another quiz active currently. Worst case scenario is
    // user has very poor network received the previous quiz late
    this.dropQuiz();

    infoNotification.play();

    // Close leaderboard if open else quiz won't be visible
    this.setLeaderboardOpen(false);

    // Unmaximised screen for better experience
    if (this.meeting.videoBroadcasting) {
      this.meeting.videoBroadcasting.setPinnedStreamId(null);
    }

    // Create and start quiz
    this.quiz = new LiveQuiz(data, this, isDummy);
    this.quiz.start();
  }

  load() {
    this._initialiseSocketConnection();
  }

  endMeetingForAll = flow(function* () {
    try {
      yield this.socket.sendAsync(ActionTypes.endMeeting);
      toast.show({
        message: 'Ended meeting for all',
        type: 'info',
      });
      this.meeting.end('manual');
    } catch (error) {
      toast.show({
        message: 'Failed to end meeting for all',
        type: 'error',
      });
      logEvent('error', 'SocketError: Failed to end meeting', error);
    }
  });

  fetchLeaderboard() {
    this.socket.send(ActionTypes.fetchLeaderboard, {}, 3);
  }

  fetchPlaylistSessionStatus() {
    this.socket.send(ActionTypes.fetchPlaylistSessionStatus, {}, 3);
  }

  launchDummyQuiz() {
    if (this.quiz) {
      toast.show({
        message: 'Cannot launch sample quiz while another quiz is in progress!',
        type: 'error',
      });
      return;
    }
    this.socket.send(ActionTypes.launchDummyQuiz, {}, 3);
  }

  toggleBan = flow(function* (userId) {
    try {
      const participant = this.meeting.getParticipant(userId);
      const banned = !participant.isBanned;
      yield this.socket.sendAsync(
        ActionTypes.toggleBan,
        { user_id: userId, banned },
      );
      participant.setBanned(banned);
    } catch (error) {
      toast.show({
        message: 'Failed to update',
        type: 'error',
      });
      logEvent('error', 'SocketError: Failed to toggle ban', error);
    }
  });

  updateSettingForAll = flow(function* (name, value) {
    const currentValue = this.settings[name];
    try {
      this._updateLocalSetting(name, value);
      yield this.socket.sendAsync(
        ActionTypes.changeSetting,
        { name, value },
      );
    } catch (error) {
      // Revert if failed to update
      this._updateLocalSetting(name, currentValue);
      toast.show({
        message: 'Failed to update',
        type: 'error',
      });
      logEvent('error', 'SocketError: Failed to update settings', error);
    }
  });

  loadRecordingStatus() {
    this.socket.send(ActionTypes.loadRecordingStatus, {}, 3);
  }

  muteAudience = flow(function* (userId) {
    try {
      yield this.socket.sendAsync(
        ActionTypes.muteAudience,
        { user_id: parseInt(userId, 10) },
      );
      const participant = this.meeting.getParticipant(userId);
      participant.setUnmuted(false);
    } catch (error) {
      toast.show({
        message: 'Failed to mute participant',
        type: 'error',
      });
      logEvent('error', 'SocketError: Failed to mute audience', error);
    }
  });

  disableChat = flow(function* (userId) {
    try {
      yield this.socket.sendAsync(
        ActionTypes.disableChat,
        { user_id: parseInt(userId, 10) },
      );
      const participant = this.meeting.getParticipant(userId);
      participant.setChatDisabled(true);
    } catch (error) {
      toast.show({
        message: 'Failed to Disble Chat for participant',
        type: 'error',
      });
      logEvent('error', 'Failed to Disble Chat for participant', error);
    }
  });

  enableChat = flow(function* (userId) {
    try {
      yield this.socket.sendAsync(
        ActionTypes.enableChat,
        { user_id: parseInt(userId, 10) },
      );
      const participant = this.meeting.getParticipant(userId);
      participant.setChatDisabled(false);
    } catch (error) {
      toast.show({
        message: 'Failed to Enable Chat for participant',
        type: 'error',
      });
      logEvent('error', 'Failed to Enable Chat for participant', error);
    }
  });

  raiseHand = flow(function* () {
    if (this.isRaisingHand || this.isHandRaised) {
      return;
    }

    this.isRaisingHand = true;
    this.raiseHandError = null;

    try {
      yield this.socket.sendAsync(ActionTypes.raiseHand);
      this.meeting.track('raisedHand');
      this._lockRaisedHand();
      toast.show({
        message: `Host will see your hand raised for next `
          + `${HAND_RAISE_TIMEOUT} seconds`,
      });
    } catch (error) {
      this.raiseHandError = error;
      toast.show({
        message: 'Failed to raise hand',
        type: 'error',
      });
      logEvent('error', 'SocketError: Failed to raise hand', error);
    }

    this.isRaisingHand = false;
  });

  startDoubtSession = flow(function* () {
    if (this.doubtSessionStarted) {
      return;
    }

    this.doubtSessionStarted = true;

    try {
      yield this.socket.sendAsync(ActionTypes.startDoubtSession);
      toast.show({
        message: `Successfully started the Doubt Session`,
      });
    } catch (error) {
      toast.show({
        message: 'Failed to start Doubt Session',
        type: 'error',
      });
      this.doubtSessionStarted = false;
      logEvent('error', 'SocketError: Failed to start Doubt Session', error);
    }
  });

  unmuteAudience = flow(function* (userId) {
    try {
      yield this.socket.sendAsync(
        ActionTypes.unmuteAudience,
        { user_id: parseInt(userId, 10) },
      );
      const participant = this.meeting.getParticipant(userId);
      participant.setUnmuted(true);
    } catch (error) {
      toast.show({
        message: 'Failed to unmute participant',
        type: 'error',
      });
      logEvent('error', 'SocketError: Failed to unmute audience', error);
    }
  });

  updateRecordedStream(data) {
    this.socket.send(ActionTypes.updateRecordedStream, data, 3);
  }

  /**
   * To make sure that if socket exists then it is subscribed to events.
   */
  subscribeToSocketIfNeeded() {
    if (this.socket && isNullOrUndefined(this.socket.subscription)) {
      this.socket.subscribe();
    }
  }

  saveMessage(data, isDeleted = false) {
    if (isDeleted) {
      this.socket.send(ActionTypes.deleteMessage, data, 2);
    } else {
      this.socket.send(ActionTypes.text, data, 2);
    }
  }

  saveReaction(reactionType) {
    this.socket.send(ActionTypes.reaction, { body: reactionType }, 2);
  }

  setLeaderboard(data) {
    const myPosition = data.myPosition || {};
    this.setMyLeaderboardEntry(myPosition);
    let { myLeaderboardEntry } = this;

    const leaderboard = [];

    data.list.some(item => {
      const participant = this.meeting.findOrCreateParticipant(item.user_id);
      const entry = this._setLeaderboardEntry(participant, item);

      if (entry.mine) {
        myLeaderboardEntry = entry;
      }

      if (item.rank <= 10) {
        leaderboard.push(entry);
      }

      if (item.rank > 10 && myLeaderboardEntry.rank !== Infinity) {
        return true;
      }

      return false;
    });

    // Super hosts don't have leaderboard entry
    if (!this.meeting.isSuperHost) {
      this.myLeaderboardEntry = myLeaderboardEntry;
    }
    this.numProblems = data.numProblems;
    this.leaderboard = leaderboard;
  }

  // If `closesIn` is passed a value greater than 0 then leaderboard will auto
  // close in `closesIn` ms
  setLeaderboardOpen(isOpen, closesIn = 0) {
    clearTimeout(this._leaderboardCloseTimeout);

    this.isLeaderboardOpen = isOpen;

    if (isOpen && closesIn > 0) {
      this._leaderboardCloseTimeout = setTimeout(() => {
        this.setLeaderboardOpen(false);
      }, closesIn);
    }
  }

  setPlatformFeedbackOpen(isOpen) {
    this.isPlatformFeedbackOpen = isOpen;
  }

  setOnlineUserCount(count) {
    this.onlineUserCount = count;
  }

  setStatus(status) {
    this.isConnected = status === SocketStatus.connected;

    this.status = status;

    this.meeting.track(`socket-${status}`);
  }

  setTemporaryHost(isHost, token = null, track = true) {
    this.temporaryHostToken = token;
    this.isTemporaryHost = isHost;
    this.meeting.currentParticipant.setUnmuted(isHost);
    if (track) {
      this.meeting.track(isHost ? 'unmuted' : 'muted');
    }
  }

  setChatDisabled(isChatDisabled) {
    this.isChatDisabled = isChatDisabled;
  }

  setSettings(settings) {
    this.settings = settings;
  }

  setMyLeaderboardEntry(position) {
    if (this.meeting.isSuperHost) {
      return;
    }

    const { currentParticipant } = this.meeting;
    this.myLeaderboardEntry = {
      ...this.myLeaderboardEntry,
      ...{
        participant: currentParticipant,
        rank: position.rank || this.myLeaderboardEntry.rank || Infinity,
        score: position.score || this.myLeaderboardEntry.score || 0,
        solved: position.solved || this.myLeaderboardEntry.solved || 0,
        userId: this.userId,
        mine: true,
      },
    };
  }

  sendEventToQuestion(eventName, data) {
    const question = this.meeting.getQuestion(data.question.id);
    if (question) {
      question.emit(eventName, data);
    }
  }

  get isRaiseHandDisabled() {
    return this.isRaisingHand || this.isHandRaised;
  }

  get isQuestionsDisabled() {
    return this.settings?.questions_disabled ?? false;
  }

  get activeScreenUserId() {
    return this.settings && String(this.settings.active_screen_share_user_id);
  }

  get channelName() {
    return this.meeting.slug;
  }

  get meeting() {
    return this._meeting;
  }

  get socket() {
    return this._socket;
  }

  get user() {
    return this.meeting.user;
  }

  get userId() {
    return this.meeting.userId;
  }

  /* Event handlers */

  _handleConnecting = () => {
    this.setStatus(SocketStatus.connecting);
  };

  _handleConnected = () => {
    this.setStatus(SocketStatus.connected);
    this._initiateConnectionAliveCalls();
  };

  _handleDisconnected = () => {
    this.setStatus(SocketStatus.disconnected);
  };

  _handleError = () => {
    this.setStatus(SocketStatus.error);
  };

  _handleRejected = () => {
    this.setStatus(SocketStatus.rejected);
  };

  _handleForceRejected = (data) => {
    if (this.connectionId === data.connection_id) {
      this.setStatus(SocketStatus.rejected);
    }
  };

  _handleHandRaised = (data) => {
    const participant = this.meeting.updateParticipant(data.participant);
    participant.setHandRaised(true);
    snackbar.show({
      message: `${participant.name} has raised hand`,
      duration: 5000,
      action: () => {
        this.unmuteAudience(participant.userId);
        snackbar.hide();
      },
      label: 'Unmute',
      type: 'light',
      position: {
        bottom: 90,
        left: 30,
      },
    });
  };

  _handleDoubtSessionStarted = () => {
    this.doubtSessionStarted = true;
    if (!this.meeting.isSuperHost) {
      toast.show({
        message: 'Doubt session has been started. Feel free to ask your '
          + 'doubts. If you don\'t have any doubts you can leave the session.',
        duration: 5000,
      });
      this.meeting.dispatchEvent(meetingEvents.DOUBT_SESSION_STARTED);
    }
  };

  _handleBanToggled = (data) => {
    if (data.banned) {
      this.meeting.end('banned');
    }
  };

  _handleDummyQuiz = () => {
    if (this.meeting.isSuperHost) {
      toast.show({
        message: 'Sample quiz has been launched, will be completed in 30 secs',
      });
    } else if (!this.quiz) {
      toast.show({
        message: 'Host has launched a sample quiz!',
      });
      this.launchQuiz(DUMMY_QUIZ, true);
    }
  };

  _handleSettingChanged = (data) => {
    const { name, value } = data;
    this._updateLocalSetting(name, value);
    this.meeting.messaging.handleSettingChange(name, value);
  };

  _handleMuted = () => {
    if (this.user.role === 'audience') {
      this.setTemporaryHost(false);
      toast.show({ message: 'You have been muted' });
    }
  };

  _handleChatEnabled = () => {
    if (this.user.role === 'audience') {
      this.setChatDisabled(false);
      toast.show({ message: 'Your chat & questions has been enabled' });
    }
  };

  _handleParticipantChanged = (data) => {
    this.meeting.updateParticipant(data.participant);
  };

  _handleUnmuted = (data) => {
    if (this.user.role === 'audience') {
      this.setTemporaryHost(true, data.token);
      toast.show({ message: 'You have been unmuted' });
    }
  };

  _handleChatDisabled = () => {
    if (this.user.role === 'audience') {
      this.setChatDisabled(true);
      toast.show({ message: 'Your chat & questions has been disabled' });
    }
  };

  _handleRecordingUpdated = (data) => {
    const { status, ...other } = data;
    this.meeting.recording.setData(other);
    if (
      this.meeting.isSuperHost
      && recordingErrorStatuses.includes(data.status)
    ) {
      alertNotification.play();
      snackbar.show({
        message: `Recording has stopped unexpectedly.`,
        duration: 15000,
        type: 'error',
        action: () => snackbar.hide(),
        label: 'Close',
        position: 'top-left',
      });
    }
  };

  _handleMeetingEnded = (data) => {
    const endedBy = String(data.ended_by || -1);
    if (endedBy === this.meeting.userId) {
      this.meeting.end('manual');
    } else {
      this.meeting.end('forced');
    }
  };

  _handleQuizPublished = (data) => {
    const quiz = transformQuizData(
      data.quiz,
      data.quiz_problems,
      data.performance_timer_enabled,
    );
    this.launchQuiz(quiz);
  };

  _handlePollPublished = (data) => {
    const { poll, publisher_id: publisherId } = data;
    this.launchPoll(poll, publisherId);
  };

  _handleSurveyPublished = (data) => {
    const { survey, publisher_id: publisherId } = data;
    this.launchSurvey(survey, publisherId);
  };

  _handleLeaderboardUpdated = (data) => {
    const {
      ranklist: list,
      num_of_problems: numProblems,
    } = data.leaderboard;
    const myPosition = data.my_position || {};
    const rankHolders = data.rank_holders;
    this.meeting.updateParticipants(rankHolders);

    this.setLeaderboard({
      list, numProblems, myPosition,
    });
  };

  _handleOnlineUserCount = (data) => {
    this.setOnlineUserCount(data.count);
  };

  _handleOnlineUsers = (data) => {
    this.meeting.updateOnlineParticipants(data.user_ids);
  };

  _handleNewQuestion = (data) => {
    this.meeting.updateParticipant(data.asker);
    this.meeting.addOrUpdateQuestion(data.question);
  };

  _handleQuestionBotResponseAckByAsker = (data) => {
    this.sendEventToQuestion('bot_response_ack_by_asker', data);
  };

  _handleQuestionBotResponseApprovedByHost = (data) => {
    this.sendEventToQuestion('bot_response_approved_by_host', data);
  };

  _handleQuestionBotResponseRejectedByHost = (data) => {
    this.sendEventToQuestion('bot_response_rejected_by_host', data);
  };

  _handleQuestionStatusChange = (data) => {
    const question = this.meeting.getQuestion(data.question_id);
    if (question) {
      question.emit('status_change', data);
    }
  };

  _handleQuestionVote = (data) => {
    const question = this.meeting.getQuestion(data.question_id);
    if (question) {
      question.emit('vote', data);
    }
  };

  _handleDisableAutoResponses = () => {
    this.meeting.setAutoResponsesEnabled(false);
  };

  _handleNewProxyMessage = (data) => {
    const localMessage = new TextMessage(
      this.meeting.messaging,
      data.message.proxy_user_id,
      Date.now(),
      {
        body: data.message.body,
        toId: data.message.to_id,
        isProxyUser: true,
        type: data.message.message_type,
        proxyUserName: data.message.proxy_user_name,
      },
      false,
    );
    this.meeting.messaging.addMessageToQueue(localMessage);
  };

  _handlePlaylistContentSessionUpdated = ({
    stream_participants: participants,
    ...data
  }) => {
    // Update participants info of the users whom these streams will be
    // mimicing
    this.meeting.updateParticipants(participants);

    // Temp logging
    if (this.meeting.playlist) {
      logEvent(
        'info',
        'ComposedVideoSessionInfo: Received update from server',
        data,
      );
    }

    // Handling for streams that all users will be seeing
    this.meeting.processComposedVideoSession(data);
  };

  _handleNudge = (data) => {
    this.meeting.nudge.setCurrentNudge(data.data);
  };

  _handleRemoveNudge = () => {
    this.meeting.nudge.removeCurrentNudge();
  };

  _handlePlaylistContentSessionStatusUpdated = (data) => {
    // Refresh session status for all super hosts apart from
    // the one who initiated the change
    if (String(data.user_id) !== this.userId) {
      this.meeting.playlist.loadSessions(true);
    }
  };

  _handleSyncProxyUpvotes = (data) => {
    const { proxy_user_id: proxyUserId, questions } = data;

    questions.forEach((questionData) => {
      const question = this.meeting.getQuestion(questionData.id);
      if (question) {
        question.syncProxyUpvotes(proxyUserId, questionData.votes);
      }
    });
  };

  /* Private */

  _addEventListeners() {
    SOCKET_EVENTS.forEach(eventName => {
      const handlerFnName = camelCase(`handle-${eventName}`);

      // To make sure that we never add more than one listener for every event
      this.socket.off(eventName, this[`_${handlerFnName}`]);
      this.socket.on(eventName, this[`_${handlerFnName}`]);
    });

    SOCKET_EVENTS_TO_TRACK.forEach(eventName => {
      // To make sure that we never add more than one listener for every event
      this.socket.off(eventName, this.meeting.trackSocketEvent);
      this.socket.on(eventName, this.meeting.trackSocketEvent);
    });
  }

  _addUnmuteReaction() {
    this._unmuteReaction = reaction(
      () => this.isTemporaryHost,
      (isTemporaryHost) => {
        let mode = null;
        if (isTemporaryHost) {
          mode = BroadcastSetupModes.audience;
        } else {
          this.meeting.setSelectedRole('audience');
        }

        this.meeting.setBroadcastSetupMode(mode);
      },
    );
  }

  _initialise(state) {
    this._setInitialState(state);
    this._initialiseSocketConnection();
  }

  async _initialiseSocketConnection() {
    this._removeEventListeners();
    this.connectionId = await dateApi.getCurrentTime(true);
    this._socket = new Socket(
      'MeetingsChannel',
      {
        meeting_slug: this.channelName,
        connection_id: this.connectionId,
      },
    );
    this._addEventListeners();
  }

  _lockRaisedHand = flow(function* () {
    this.isHandRaised = true;
    yield wait(HAND_RAISE_TIMEOUT * 1000);
    this.isHandRaised = false;
  });

  _setInitialState(state) {
    this.setStatus(SocketStatus.connecting);
    this.setTemporaryHost(state.isTemporaryHost, null, false);
    this.setChatDisabled(state.isChatDisabled);
    this.doubtSessionStarted = state.doubtSessionStarted;
  }

  _removeEventListeners() {
    if (this.socket) {
      SOCKET_EVENTS.forEach(eventName => {
        const handlerFnName = camelCase(`handle-${eventName}`);
        this.socket.off(eventName, this[`_${handlerFnName}`]);
      });

      SOCKET_EVENTS_TO_TRACK.forEach(eventName => {
        this.socket.off(eventName, this.meeting.trackSocketEvent);
      });
    }
  }

  _updateLocalSetting(name, value) {
    const settings = { ...this.settings };
    settings[name] = value;
    this.setSettings(settings);
  }

  _initiateConnectionAliveCalls() {
    clearInterval(this._connectionAliveNotifier);
    this._connectionAliveNotifier = setInterval(() => {
      this.socket.send('pong');
    }, PONG_INTERVAL);
  }

  _setLeaderboardEntry(participant, data) {
    return {
      ...data,
      participant,
      rank: data.rank,
      score: data.score,
      userId: data.user_id,
      solved: data.solved,
      mine: String(data.user_id) === this.userId,
    };
  }
}

export default MeetingManager;
