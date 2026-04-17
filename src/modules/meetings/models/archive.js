import {
  action,
  computed,
  flow,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import throttle from 'lodash/throttle';
import orderBy from 'lodash/orderBy';
import pickBy from 'lodash/pickBy';

import {
  BOOKMARK_TYPES,
} from '~meetings/utils/constants';
import { canResumePlayback } from '~meetings/utils/recordings';
import { combineIntervals } from '~meetings/utils/misc';
import { generateUUID } from '@common/utils/misc';
import { isNegativeContent } from '~meetings/utils/meeting';
import { logEvent } from '@common/utils/logger';
import { MessageTypes } from '~meetings/utils/messaging';
import { transformQuizData } from '~meetings/utils/quiz';
import archiveApi from '~meetings/api/archive';
import ArchivedMessage from './archivedMessage';
import NoticeBoard from './noticeBoard';
import NoticeBoardV2 from './noticeBoardV2';
import ArchivedQuiz from './archivedQuiz';
import AudioNotification from '@common/lib/audioNotification';
import bookmarksApi from '~meetings/api/bookmarks';
import LocalStorage from '@common/lib/localStorage';
import MeetingBase from './meetingBase';
import meetingEvents from '~meetings/events';
import {
  getNonOverlappingIntervals,
  mergeIntervals,
} from '@common/utils/intervals';
import { isNullOrUndefined } from '@common/utils/type';
import { useQuery } from '@common/hooks';

const lsKey = '__video_events__';
const bulkEventsToProcess = 10;
const infoNotification = new AudioNotification('info');

class Archive extends MeetingBase {
  _noticeBoard = null;

  _progress = {};

  /**
   * A unique id to identify the current session.
   * Used to better handle archive event capturing across multiple tabs on
   * same browser.
   *
   * NOTE: Everytime playing video is changed we generate a new `sessionId`
   */
  sessionId = generateUUID();

  isLoading = false;

  lastReadMessageIndex = -1;

  loadError = null;

  allMessages = observable.array([], { deep: false });

  messages = [];

  playlist = [];

  quiz = null;

  quizzes = [];

  leaderboard = [];

  completeLeaderboard = [];

  numProblems = 0;

  myLeaderboardEntry = null;

  myArchiveLeaderboardEntry = null;

  isLeaderboardOpen = false;

  events = [];

  durationQueue = [0];

  capturingEvents = false;

  isPlaying = null;

  isFullscreen = false;

  // Index of the currenlty playing recording in the `playlist` array
  currentRecordingIndex = null;

  currentTimestamp = Date.now();

  selectedVideo = null;

  showQuestions = true;

  arePlayerControlsVisible = false;

  trackId = null;

  isLive = false;

  _prevIntervals = {}

  _currentIntervals = {}

  syncCurrentTimeLoading = false

  _missingBookmarks = {};

  constructor(data) {
    super(data);
    this.load();

    this.loadMissingBookmarks();

    this._initLocalStorage();
    this._addMessageListUpdateReaction();
    makeObservable(this, {
      _setMyArchiveLeaderBoardEntry: action.bound,
      _missingBookmarks: observable,
      _noticeBoard: observable.ref,
      allBookmarks: computed,
      arePlayerControlsVisible: observable,
      currentBookmarks: computed,
      currentRecording: computed,
      currentRecordingIndex: observable,
      currentTime: computed,
      currentTimestamp: observable,
      hasQuestionBookmarks: computed,
      hideBookmarkInput: action.bound,
      hasMissingBookmarks: computed,
      isLoading: observable,
      lastReadMessageIndex: observable,
      loadError: observable.ref,
      loadErrorMessage: computed,
      messages: observable.ref,
      missingBookmarks: computed,
      isPlaying: observable,
      isFullscreen: observable,
      playlist: observable.ref,
      quiz: observable.ref,
      quizzes: observable.ref,
      selectedVideo: observable.ref,
      showQuestions: observable,
      setIsPlaying: action,
      leaderboard: observable.ref,
      isLeaderboardOpen: observable,
      numProblems: observable,
      myLeaderboardEntry: observable.ref,
      myArchiveLeaderboardEntry: observable.ref,
      showBookmarkInput: action.bound,
      setPlayerControlsVisible: action.bound,
      setFullscreen: action.bound,
      setCurrentRecordingIndex: action.bound,
      setCurrentTimestamp: action.bound,
      setLastReadMessageIndex: action.bound,
      setSelectedVideo: action.bound,
      setShowQuestions: action.bound,
      launchQuiz: action.bound,
      dropQuiz: action.bound,
      setLeaderboardOpen: action.bound,
      unreadMessageCount: computed,
      activeInLiveQuiz: computed,
      popoverActiveQuiz: computed,
      noticeBoard: computed,
    });
  }

  /* Public */

  addBookmark = flow(function* (data = {}) {
    this.isCreatingBookmark = true;

    try {
      const json = yield bookmarksApi.create(
        this.slug,
        {
          title: data.title || this.bookmarkInput,
          start_time: this.currentTime,
          description: data.title || this.bookmarkInput,
          recording_id: this.currentRecording.id,
          type: data.type,
        },
        data.playlistContentId,
      );

      this.bookmarkInput = '';
      this.hideBookmarkInput();
      this._addBookmark(json.bookmark);
      this.setScrollToBookmarkSlug(json.bookmark.slug);
      this.isCreatingBookmark = false;

      if (data?.type === BOOKMARK_TYPES.cueCards) {
        this._deleteMissingBookmark(data.playlistContentId);
      }
    } catch (error) {
      this.isCreatingBookmark = false;
      throw error;
    }
  }).bind(this);

  removeTransferedBookmarks(data) {
    const res = data?.map(id => ({ id: parseInt(id, 10) }));
    res?.map((ele) => {
      this._deleteMissingBookmark(ele.id);
    });
  }

  hideBookmarkInput() {
    this.setBookmarkInput('');
    this.bookmarkInputVisible = false;
    this.setIsPlaying(true);
  }

  showBookmarkInput() {
    const existingBookmark = this.currentBookmarks.find(
      o => parseInt(o.start_time, 10) === parseInt(this.currentTime, 10),
    );
    if (existingBookmark) {
      this.setScrollToBookmarkSlug(existingBookmark.slug);
    } else {
      this.bookmarkInputVisible = true;
    }
    this.setIsPlaying(false);
  }

  askToLaunchQuiz(quiz) {
    if (this.quiz) {
      return;
    }
    this._resetPopovers();
    quiz.setPopover(true);
  }

  captureEventsNatively(intervals) {
    if (!intervals) {
      return;
    }
    this._reloadEvents();
    const videoId = this.currentRecording.id;
    if (isNullOrUndefined(this._prevIntervals[videoId])) {
      this._prevIntervals[videoId] = [];
    }
    const currentEvents = this.events.filter(
      (event) => (
        event.sessionId !== this.sessionId
        || event.videoId !== videoId
      ),
    );
    const playedIntervals = [];
    const intervalsLength = intervals.length;
    for (let i = 0; i < intervalsLength; i += 1) {
      playedIntervals.push(
        [intervals.start(i), intervals.end(i)],
      );
    }
    const currentIntervals = [...playedIntervals];
    const prevIntervals = [...this._prevIntervals[videoId]];
    const mergedIntervals = mergeIntervals([
      ...currentIntervals,
      ...prevIntervals,
    ]);
    const newIntervals = getNonOverlappingIntervals(
      mergedIntervals,
      prevIntervals,
    );
    const events = this._generateEventsFromIntervals(newIntervals);
    this._currentIntervals = {
      ...this._currentIntervals,
      [videoId]: mergedIntervals,
    };
    this.events = [...currentEvents, ...events];
    this._localStorage.events = this.events;
  }

  async syncCurrentPlayingTime(currentTime) {
    const videoId = this.currentRecording.id;
    this._reloadEvents();

    const { events } = this;
    const duration = combineIntervals(events);

    if (this.syncCurrentTimeLoading) return;
    try {
      this.syncCurrentTimeLoading = true;
      const { trackId } = await bookmarksApi.syncPlayingTime(
        this.slug,
        {
          time: currentTime,
          video_id: videoId,
          track_id: this.trackId,
          duration,
          location: document.referrer,
        },
      );
      this.trackId = trackId;
    } catch (error) {
      logEvent(
        'error',
        'VideoBookmarkError: Failed to save the current time',
        error,
      );
    }
    this.syncCurrentTimeLoading = false;
  }

  captureEvent(eventType, currentTime, isPlaying, force = false) {
    let eventHash = {
      videoId: this.playlist[this.currentRecordingIndex].id,
      isPlaying,
    };

    if (isPlaying && eventType === 'seeked') {
      const seekStartTime = this.durationQueue[0];
      eventHash = {
        ...eventHash,
        ...{
          unique_id: Date.now(),
          event: 'seek_start',
          time: seekStartTime,
        },
      };
      this.events.push(eventHash);
    }

    eventHash = {
      ...eventHash,
      ...{
        unique_id: Date.now(),
        event: eventType,
        time: currentTime,
      },
    };
    this.events.push(eventHash);

    this._localStorage.events = this.events;

    if (force
      || (this.events.length >= bulkEventsToProcess && !this.capturingEvents)
    ) {
      this.capturingEvents = true;
      this._saveCapturedEvents();
    }
  }

  destroy() {
    if (this._messageListUpdateReaction) {
      this._messageListUpdateReaction();
    }
  }

  dropQuiz() {
    if (this.quiz) {
      this.quiz.destroy();
      this.quiz = null;
    }
  }

  fetchMyLeaderboardRank = flow(function* () {
    try {
      const json = yield archiveApi.myRank(this.slug);
      this._setMyArchiveLeaderBoardEntry(json);
    } catch (error) {
      logEvent(
        'error',
        'ArchiveLeaderboardError: Failed to load my rank',
        error,
      );
    }
  });

  launchQuiz(quiz) {
    // Don't do anything if a quiz is already in progress
    if (this.quiz) {
      return;
    }

    this._resetPopovers();

    this.dropQuiz();

    infoNotification.play();

    // Create and start quiz
    this.quiz = quiz;
    if (this.quiz.isStarted) {
      return;
    }
    if (!quiz.isEnded) {
      this.isPlaying = false;
    }
    this.quiz.start();
  }

  load = flow(function* () {
    this.isLoading = true;
    this.loadError = null;

    try {
      const json = yield archiveApi.getItem(this.slug);
      this._createParticipants(json.participants);
      this._createMessages(json.messages);
      this._createNoticeBoard(json);
      this._createPlaylist(json.recordings);
      this._createBookmarks(json.bookmarks);
      this.dispatchEvent(meetingEvents.JOINED_RECORDED_MEETING);
    } catch (error) {
      logEvent('error', 'ArurnchiveError: Failed to load', error);
      this.loadError = error;
    }

    this.isLoading = false;
  });

  loadMissingBookmarks = flow(function* () {
    if (!this.isSuperHost) {
      return;
    }
    try {
      const json = yield bookmarksApi.getMissingBookmarks(this.id);
      this._createMissingBookmarks(json);
    } catch (error) {
      logEvent('error', 'MissingBookmarksError: Failed to load', error);
    }
  });

  loadQuizzes = flow(function* () {
    try {
      const json = yield archiveApi.getQuizzes(this.slug);
      if (json) {
        this._createQuizzes(json.quizzes, json.quiz_problems);
        this.updateParticipants(json.participants);
        this.completeLeaderboard = json.leaderboard;
      }
    } catch (error) {
      logEvent('error', 'ArchiveQuizzesError: Failed to load', error);
    }
  });

  refreshLeaderboard = flow(function* () {
    try {
      yield this.fetchMyLeaderboardRank();
      this._setLeaderboard(this.completeLeaderboard);
    } catch (error) {
      logEvent(
        'error',
        'ArchiveLeaderboardError: Failed to Update Leaderboard',
        error,
      );
    }
  });

  saveProgressInLS() {
    const progress = this._localStorage.progress || {};

    this.playlist.forEach(item => {
      if (this._progress[item.id]) {
        progress[item.id] = this._progress[item.id];
      } else {
        delete progress[item.id];
      }
    });
    this._localStorage.progress = progress;
  }

  setCurrentRecordingIndex(recordingIndex) {
    // Generate new session id everytime video src is changed as played
    // property of video resets when src changes
    this.syncCapturedEvents();
    this.currentRecordingIndex = recordingIndex;
    this.durationQueue = [0];
    this.setCurrentTimestamp();
  }

  setCurrentTimestamp(currentTime = 0) {
    const currentRecording = this.playlist[this.currentRecordingIndex];
    if (currentRecording && currentRecording.startedAt) {
      this.currentTimestamp = currentRecording.startedAt + (currentTime * 1000);
    } else {
      this.currentTimestamp = Date.now();
    }
  }

  setFullscreen(isFullscreen) {
    this.isFullscreen = isFullscreen;
  }

  setIsPlaying(value) {
    this.isPlaying = value;
  }

  setLastReadMessageIndex(messageIndex) {
    this.lastReadMessageIndex = messageIndex;
  }

  setLeaderboardOpen(isOpen, closesIn = 0) {
    clearTimeout(this._leaderboardCloseTimeout);

    if (this.quiz) {
      return;
    }

    this.isLeaderboardOpen = isOpen;

    if (isOpen) {
      this.refreshLeaderboard();
      if (closesIn > 0) {
        this._leaderboardCloseTimeout = setTimeout(() => {
          this.setLeaderboardOpen(false);
        }, closesIn);
      }
    } else {
      this.isPlaying = true;
    }
  }

  setPlayerControlsVisible(isVisible) {
    this.arePlayerControlsVisible = isVisible;
  }

  setSelectedVideo(video) {
    this.selectedVideo = video;
  }

  seekToVideo(videoId, startTime) {
    const recording = this.playlist.find(
      o => o.id === Number(videoId),
    );
    if (recording) {
      this.setSelectedVideo({
        src: recording.src,
        resumeAt: Number(startTime),
      });
    }
  }

  setShowQuestions(state) {
    this.showQuestions = state;
  }

  // eslint-disable-next-line class-methods-use-this
  track(actionType, ...args) {
    return new Promise(resolve => {
      if (window.storeEsEvent) {
        window.storeEsEvent(actionType, ...args);
      }
      resolve();
    });
  }

  trackEvent(eventName, attributes = {}) {
    super.trackEvent(
      eventName,
      {
        ...attributes,
        viewType: 'archive',
      },
    );
  }

  updateDurationQueue(currentTime) {
    if (this.durationQueue.length >= 3) {
      this.durationQueue.shift();
    }
    this.durationQueue.push(currentTime);
  }

  // Run this method atmost once per second
  updateMessageList = throttle(() => {
    runInAction(() => {
      this.messages = this.allMessages.filter(
        message => message.timestamp <= this.currentTimestamp,
      );
    });
  }, 1000);

  updateResumeAt(resumeAt) {
    const { id } = this.currentRecording;
    this._progress[id] = {
      resumeAt,
      savedAt: Date.now(),
    };
  }

  async syncCapturedEvents() {
    this._reloadEvents();
    const events = this.events.filter(
      event => event.sessionId === this.sessionId,
    );
    if (!events.length) return;
    try {
      const { processedEventIds } = await archiveApi.captureEvents({
        events,
        session_id: this.sessionId,
      });
      const currEvents = [...this.events];
      const filteredProcessedEvents = currEvents.filter(
        (event) => !processedEventIds.includes(event.unique_id),
      );
      this.events = filteredProcessedEvents;
      this._localStorage.events = this.events;
      this._prevIntervals = this._currentIntervals;
    } catch (error) {
      this.track('sync-events-failed');
    } finally {
      this.sessionId = generateUUID();
    }
  }

  get userId() {
    return String(this.user.user_id);
  }

  get allBookmarks() {
    return this.playlist.map((recording, index) => ({
      title: `Part ${index + 1}`,
      bookmarks: this._findBookmarks(recording.id),
    }));
  }

  get hasQuestionBookmarks() {
    return Object.values(this._allBookmarks)
      .some((bookmark) => bookmark.bookmark_type === 'question');
  }

  get currentBookmarks() {
    if (this.currentRecording) {
      return this._findBookmarks(this.currentRecording.id);
    } else {
      return [];
    }
  }

  get currentRecording() {
    return this.playlist[this.currentRecordingIndex];
  }

  get noticeBoard() {
    return this._noticeBoard;
  }

  get loadErrorMessage() {
    if (this.loadError) {
      if (this.loadError.isFromServer) {
        switch (this.loadError.response.status) {
          case 404:
            return 'The archive you are looking for does not exist!';
          default:
            return 'Something went wrong! Please try again in sometime';
        }
      } else {
        return 'Failed to connect with server. '
          + 'Please make sure that you are connected to internet';
      }
    } else {
      return '';
    }
  }

  get unreadMessageCount() {
    const unreadMessages = this.messages.slice(this.lastReadMessageIndex + 1);
    return unreadMessages.length;
  }

  get activeInLiveQuiz() {
    const quiz = this.quizzes.find(
      q => q.activeInLive,
    );
    return quiz;
  }

  get currentTime() {
    if (!this.currentRecording) return null;

    return (this.currentTimestamp - this.currentRecording.startedAt) / 1000;
  }

  get popoverActiveQuiz() {
    const quiz = this.quizzes.find(
      q => q.showPopover,
    );
    return quiz;
  }

  get missingBookmarks() {
    return Object.values(this._missingBookmarks);
  }

  get hasMissingBookmarks() {
    return this.missingBookmarks.length > 0 && this.isSuperHost;
  }

  /* Private */

  _addMessageListUpdateReaction() {
    this._messageListUpdateReaction = reaction(
      () => this.currentTimestamp,
      this.updateMessageList,
    );
  }

  _createMessages(messages) {
    this.allMessages.clear();

    messages.forEach(item => {
      // Do not show poll results in archived lectures
      if (item.message_type === 'poll') {
        return;
      }

      const message = new ArchivedMessage(
        this,
        String(item.user_id),
        new Date(item.created_at).getTime(),
        {
          body: item.body,
          toId: String(item.to_id || -1),
          type: item.message_type === 'pinned'
            ? MessageTypes.text : item.message_type,
          ...(item.message_type === 'pinned' && { pinned: true }),
        },
      );

      if (!this._shouldIgnoreMessage(message)) {
        this.allMessages.push(message);
      }
    });
  }

  _createNoticeBoard(data) {
    if (this.config?.newNoticeBoardEnabled) {
      this._noticeBoard = new NoticeBoardV2(
        this, { messages: data.notice_board },
      );
    } else {
      this._noticeBoard = new NoticeBoard(this, { messages: data.pinned });
    }
  }

  _createPlaylist(recordings) {
    const { video_id: videoId, start_time: startTime } = useQuery();
    let currentRecordingIndex = 0;
    if (recordings.length === 0) {
      this.setCurrentTimestamp();
      return;
    }

    this.playlist = [];

    recordings.forEach((item, index) => {
      const playlistItem = {
        id: item.id,
        title: `Part ${index + 1}`,
        duration: item.duration,
        startedAt: new Date(item.start_time).getTime(),
        resumeAt: item.resume_at,
        src: item.url,
      };

      if (item.id === videoId) {
        currentRecordingIndex = index;
      }

      const storedProgress = this._progress[item.id];

      if (
        !playlistItem.resumeAt
        && storedProgress
        && canResumePlayback({ ...storedProgress, duration: item.duration })
      ) {
        playlistItem.resumeAt = storedProgress.resumeAt;
      } else if (startTime > 0) {
        playlistItem.resumeAt = startTime;
      } else if (storedProgress) {
        // Delete expired progress
        delete this._progress[item.id];
      }

      this.playlist.push(playlistItem);
    });
    this.setCurrentRecordingIndex(currentRecordingIndex);
    this.setCurrentTimestamp();
  }

  _createQuizzes(quizzes, problems) {
    const sortedQuizzes = orderBy(Object.values(quizzes), 'start_time', 'asc');
    this.quizzes = sortedQuizzes.map((quiz, index) => {
      const data = transformQuizData(quiz, problems);
      return new ArchivedQuiz(
        this,
        { ...data, name: `Quiz ${index + 1}` },
      );
    });
  }

  _findBookmarks(recordingId) {
    const bookmarks = pickBy(
      this._allBookmarks,
      v => (
        v.video_id === recordingId
        && (
          this.showQuestions
          || v.bookmark_type !== 'question'
        )
      ),
    );
    return orderBy(Object.values(bookmarks), o => o.start_time);
  }

  _initLocalStorage() {
    this._localStorage = LocalStorage.getInstance(lsKey);
    this.events = this._localStorage.events || [];
    this._progress = { ...this._localStorage.progress || {} };
  }

  _reloadEvents() {
    this._localStorage.$_sync();
    this.events = this._localStorage.events || [];
  }

  _resetPopovers() {
    this.quizzes.forEach(archivedQuiz => {
      archivedQuiz.setPopover(false);
    });
  }

  _setMyArchiveLeaderBoardEntry(rank) {
    this.myArchiveLeaderboardEntry = {
      rank: Infinity,
      score: rank.score,
      solved: rank.solved,
    };
  }

  _setLeaderboard(data) {
    const {
      ranklist: rankList,
      num_of_problems: numProblems,
    } = data;

    const leaderboard = [];
    let inRankList = false;
    const myArchiveEntry = this.myArchiveLeaderboardEntry;
    let myLeaderboardEntry = {
      participant: this.currentParticipant,
      rank: Infinity,
      score: 0,
      solved: 0,
      userId: this.userId,
      mine: true,
    };

    rankList.some(item => {
      const participant = this.getParticipant(item.user_id);
      const entry = {
        participant,
        rank: item.rank,
        score: item.score,
        userId: item.user_id,
        solved: item.solved,
        mine: String(item.user_id) === this.userId,
      };

      if (entry.mine) {
        myLeaderboardEntry = entry;
      }

      if (myArchiveEntry.score >= item.score && !inRankList) {
        myArchiveEntry.rank = item.rank;
        inRankList = true;
      }

      if (item.rank <= 10) {
        leaderboard.push(entry);
      }

      if (item.rank > 10 && myLeaderboardEntry.rank !== Infinity) {
        return true;
      }

      return false;
    });

    if (!inRankList && myArchiveEntry.score > 0) {
      myArchiveEntry.rank = rankList.length + 1;
    }

    this.numProblems = numProblems;
    this.leaderboard = leaderboard;
    this.myLeaderboardEntry = myLeaderboardEntry;
    this.myArchiveLeaderboardEntry = myArchiveEntry;
  }

  async _saveCapturedEvents() {
    if (this.events.length === 0) {
      return;
    }

    try {
      const response = await archiveApi.captureEvents(
        { events: this.events },
      );

      const processedEvents = response.processedEventIds;
      for (let i = this.events.length - 1; i >= 0; i -= 1) {
        for (let j = processedEvents.length; j >= 0; j -= 1) {
          if (this.events[i].unique_id === processedEvents[j]) {
            this.events.splice(i, 1);
            processedEvents.splice(j, 1);
            break;
          }
        }
      }
      this._localStorage.events = this.events;
    } finally {
      this.capturingEvents = false;
    }
  }

  _shouldIgnoreMessage(message) {
    if (message.isMine) return false;

    // Hide negative message
    if (
      this.shouldHideNegativeContent
      && message.from.roleLevel < 2
      && isNegativeContent(message.body)
    ) {
      return true;
    }

    return false;
  }

  _generateEventsFromIntervals(intervals) {
    const videoId = this.currentRecording.id;
    const eventHash = { videoId, sessionId: this.sessionId };
    const result = [];
    intervals.forEach((event, index) => {
      result.push({
        ...eventHash,
        ...{
          unique_id: `${videoId}_${Date.now()}_start_${index}`,
          event: 'play',
          time: event[0],
        },
      });
      result.push({
        ...eventHash,
        ...{
          unique_id: `${videoId}_${Date.now()}_end_${index}`,
          event: 'pause',
          time: event[1],
        },
      });
    });
    return result;
  }

  _createMissingBookmarks(bookmarks) {
    bookmarks.forEach(this._addMissingBookmark);
  }

  _addMissingBookmark = (bookmark) => {
    this._missingBookmarks[bookmark.id] = bookmark;
  }

  _deleteMissingBookmark = (bookmarkId) => {
    delete this._missingBookmarks[bookmarkId];
  }
}

export default Archive;
