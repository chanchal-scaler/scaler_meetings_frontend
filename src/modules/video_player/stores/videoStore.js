import findIndex from 'lodash/findIndex';
import forOwn from 'lodash/forOwn';

import { isNullOrUndefined } from '@common/utils/type';
import LocalStorage from '@common/lib/localStorage';

const lsKey = '__vp__settings__';
export const lsItemKeys = {
  volume: '__vol__',
  playbackRate: '__pb_r__',
};

const localStorage = LocalStorage.getInstance(lsKey);

export const ActionTypes = {
  RESET: 'video_player/RESET',
  SET_CONTAINER: 'video_player/SET_CONTAINER',
  SET_CURRENT_SRC: 'video_player/SET_CURRENT_SRC',
  SET_CURRENT_TIME: 'video_player/SET_CURRENT_TIME',
  SET_DURATION: 'video_player/SET_DURATION',
  SET_ERROR: 'video_player/SET_ERROR',
  SET_ENDED: 'video_player/SET_ENDED',
  SET_FULLSCREEN: 'video_player/SET_FULLSCREEN',
  SET_LOADING: 'video_player/SET_LOADING',
  SET_META_LOADED: 'video_player/SET_META_LOADED',
  SET_MUTED: 'video_player/SET_MUTED',
  SET_PLAYBACK_RATE: 'video_player/SET_PLAYBACK_RATE',
  SET_PLAYED_FROM_PLAYLIST: 'video_player/SET_PLAYED_FROM_PLAYLIST',
  SET_PLAYING: 'video_player/SET_PLAYING',
  SET_PLAYED_INTERVALS: 'video_player/SET_PLAYED_INTERVALS',
  SET_PLAYLIST: 'video_player/SET_PLAYLIST',
  SET_PLAYLIST_OPEN: 'video_player/SET_PLAYLIST_OPEN',
  SET_PLAY_RESTRICTED: 'video_player/SET_PLAY_RESTRICTED',
  SET_PICTURE_IN_PICTURE: 'video_player/SET_PICTURE_IN_PICTURE',
  SET_QUICK_ACTION: 'video_player/SET_QUICK_ACTION',
  SET_SEEKING: 'video_player/SET_SEEKING',
  SET_SEEK_TO: 'video_player/SET_SEEK_TO',
  SET_SELECTED_VIDEO: 'video_player/SET_SELECTED_VIDEO',
  SET_VOLUME: 'video_player/SET_VOLUME',
  SET_BOOKMARK_TIME: 'video_player/SET_BOOKMARK_TIME',
  SET_EDITING_BOOKMARK: 'video_player/SET_EDITING_BOOKMARK',
  SET_HAS_CONTROLS: 'video_player/SET_HAS_CONTROLS',
  SET_BUFFERED_INTERVALS: 'video_player/SET_BUFFERED_INTERVALS',
  SET_BOOKMARK_ENABLED: 'video_player/SET_BOOKMARK_ENABLED',
  SET_QUALITY_LEVELS: 'video_player/SET_QUALITY_LEVELS',
  SET_SELECTED_QUALITY_LEVEL: 'video_player/SET_SELECTED_QUALITY_LEVEL',
  SET_APPLIED_QUALITY: 'video_player/SET_APPLIED_QUALITY',
  SET_VIDEO_PLAYER: 'video_player/SET_VIDEO_PLAYER',
};

export const initialState = {
  currentSrc: null,
  currentResumeAt: null,
  containerEl: null,
  currentTime: 0,
  played: null,
  duration: 0,
  error: null,
  isEnded: false,
  isFullscreen: false,
  isLoading: false,
  isMetaLoaded: false,
  isMuted: false,
  isPlayedFromPlaylist: false,
  isPlaying: false,
  isPlayed: false,
  isPlaylistOpen: false,
  isPiPEnabled: false,
  isSeeking: false,
  playbackRate: 1,
  seekTo: 0,
  volume: 1,
  /**
   * Should be an array of objects in the below format
   * ```json
   * {
   *   title: 'title-of-video',
   *   src: 'video-link',
   *   resumeAt: 'option-time-from-which-video should-start-playing',
   * }
   * ```
   */
  playlist: [],
  next: -1,
  quickAction: null,
  bookmarkTime: null,
  // Stores the slug of the currently editing bookmark
  editingBookmark: null,
  hasControls: false,
  bufferedIntervals: null,
  isBookmarkEnabled: false,
  qualityLevels: [],
  // -1 for auto level selection based on user bandwidth
  selectedQualityLevel: -1,
  // Applied quality can be different from selected quality as the selected
  // level is applied for next segment
  appliedQuality: null,
  singletonsNamespace: undefined,
  isPlayRestricted: false,
  videoPlayerEl: null,
};

/**
 * Load user saved settings from localStorage
 */
forOwn(lsItemKeys, (v, k) => {
  if (!isNullOrUndefined(localStorage[v])) {
    initialState[k] = localStorage[v];
  }
});

export function syncLocalStorage(state) {
  forOwn(lsItemKeys, (v, k) => {
    localStorage[v] = state[k];
  });
}

export default function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_CONTAINER:
      return { ...state, containerEl: action.payload };
    case ActionTypes.SET_CURRENT_TIME:
      return { ...state, currentTime: action.payload };
    case ActionTypes.SET_DURATION:
      return { ...state, duration: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionTypes.SET_ENDED:
      return { ...state, isEnded: action.payload };
    case ActionTypes.SET_FULLSCREEN:
      return { ...state, isFullscreen: action.payload };
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ActionTypes.SET_META_LOADED:
      return { ...state, isMetaLoaded: action.payload };
    case ActionTypes.SET_MUTED:
      return { ...state, isMuted: action.payload };
    case ActionTypes.SET_PLAYBACK_RATE:
      return { ...state, playbackRate: action.payload };
    case ActionTypes.SET_PLAYING: {
      const isPlayed = action.payload ? true : state.isPlayed;
      return { ...state, isPlaying: action.payload, isPlayed };
    }
    case ActionTypes.SET_PLAYED_INTERVALS:
      return { ...state, played: action.payload };
    case ActionTypes.SET_PLAY_RESTRICTED:
      return { ...state, isPlayRestricted: action.payload };
    case ActionTypes.SET_PICTURE_IN_PICTURE:
      return { ...state, isPiPEnabled: action.payload };
    case ActionTypes.SET_SEEKING:
      return { ...state, isSeeking: action.payload };
    case ActionTypes.SET_SEEK_TO:
      return { ...state, seekTo: action.payload };
    case ActionTypes.SET_VOLUME:
      return { ...state, volume: action.payload };
    case ActionTypes.RESET:
      return {
        ...state,
        currentTime: 0,
        duration: 0,
        error: null,
        isEnded: false,
        isLoading: false,
        isMetaLoaded: false,
        isPlaying: false,
        isSeeking: false,
        seekTo: 0,
      };
    case ActionTypes.SET_CURRENT_SRC: {
      const { src, resumeAt } = action.payload;
      const current = findIndex(state.playlist, o => o.src === src);
      let next = -1;
      const numVideos = state.playlist.length;
      if (current > -1 && numVideos > 1 && current < numVideos - 1) {
        next = current + 1;
      }
      return {
        ...state, currentSrc: src, currentResumeAt: resumeAt, next,
      };
    }
    case ActionTypes.SET_PLAYLIST:
      return { ...state, playlist: action.payload };
    case ActionTypes.SET_PLAYLIST_OPEN:
      return { ...state, isPlaylistOpen: action.payload };
    case ActionTypes.SET_PLAYED_FROM_PLAYLIST:
      return { ...state, isPlayedFromPlaylist: true };
    case ActionTypes.SET_QUICK_ACTION:
      return { ...state, quickAction: action.payload };
    case ActionTypes.SET_BOOKMARK_TIME:
      return { ...state, bookmarkTime: action.payload };
    case ActionTypes.SET_EDITING_BOOKMARK:
      return { ...state, editingBookmark: action.payload };
    case ActionTypes.SET_HAS_CONTROLS:
      return { ...state, hasControls: action.payload };
    case ActionTypes.SET_BUFFERED_INTERVALS:
      return { ...state, bufferedIntervals: action.payload };
    case ActionTypes.SET_BOOKMARK_ENABLED:
      return { ...state, isBookmarkEnabled: action.payload };
    case ActionTypes.SET_QUALITY_LEVELS:
      return { ...state, qualityLevels: action.payload };
    case ActionTypes.SET_SELECTED_QUALITY_LEVEL:
      return { ...state, selectedQualityLevel: action.payload };
    case ActionTypes.SET_APPLIED_QUALITY: {
      let appliedQuality = null;
      if (state.qualityLevels[action.payload]) {
        appliedQuality = state.qualityLevels[action.payload].height;
      }
      return { ...state, appliedQuality };
    }
    case ActionTypes.SET_VIDEO_PLAYER:
      return { ...state, videoPlayerEl: action.payload };
    default:
      return state;
  }
}
