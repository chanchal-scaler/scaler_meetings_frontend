import React, {
  useReducer, useRef, useCallback, useMemo, useEffect,
} from 'react';
import findIndex from 'lodash/findIndex';
import pick from 'lodash/pick';

import { ActionsContext, GlobalStateContext } from './context';
import { isFunction } from '@common/utils/type';
import reducer, {
  ActionTypes,
  initialState,
  lsItemKeys,
  syncLocalStorage,
} from '~video_player/stores/videoStore';

const PLAYBACK_JUMP_MAGNITUDE = 10;
const EDIT_BOOKMARK_TIMEOUT = 300; // In ms

function Provider({
  children,
  onVideoChange,
  ...remainingProps
}) {
  const editBookmarkTimer = useRef();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Sync's relavent settings to localStorage
  const lsDeps = Object.values(pick(state, Object.keys(lsItemKeys)));
  useEffect(() => {
    syncLocalStorage(state);
    // eslint-disable-next-line
  }, lsDeps);

  // Hook that triggers onVideoChange when new video is played from playlist
  useEffect(() => {
    if (state.playlist.length > 0 && isFunction(onVideoChange)) {
      const index = findIndex(
        state.playlist,
        o => o.src === state.currentSrc,
      );
      const playlistItem = state.playlist[index];
      onVideoChange(index, playlistItem);
    }
  }, [onVideoChange, state.currentSrc, state.playlist]);

  useEffect(() => {
    window.TrackingHelper?.setContext('video_player', {
      videoUrl: state.currentSrc,
      duration: state.duration,
    });

    return () => {
      window.TrackingHelper?.clearContext('video_player');
    };
  }, [state.currentSrc, state.duration]);

  const setContainer = useCallback((el) => {
    dispatch({ type: ActionTypes.SET_CONTAINER, payload: el });
  }, []);

  const setVideoPlayer = useCallback((el) => {
    dispatch({ type: ActionTypes.SET_VIDEO_PLAYER, payload: el });
  }, []);

  /* Loading handlers */

  const setLoading = useCallback((isLoading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
  }, []);

  const setMetaLoaded = useCallback((isMetaLoaded) => {
    dispatch({ type: ActionTypes.SET_META_LOADED, payload: isMetaLoaded });
  }, []);

  /* Play/Pause handlers */

  const setPlaying = useCallback((isPlaying) => {
    dispatch({ type: ActionTypes.SET_PLAYING, payload: isPlaying });
  }, []);

  const setPlayedIntervals = useCallback((played) => {
    dispatch({ type: ActionTypes.SET_PLAYED_INTERVALS, payload: played });
  }, []);

  const play = useCallback(() => {
    dispatch({ type: ActionTypes.SET_PLAYING, payload: true });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: ActionTypes.SET_PLAYING, payload: false });
  }, []);

  const togglePlay = useCallback(() => {
    dispatch({ type: ActionTypes.SET_PLAYING, payload: !state.isPlaying });
  }, [state.isPlaying]);

  /* Mute/Unmute handlers */

  const mute = useCallback(() => {
    dispatch({ type: ActionTypes.SET_MUTED, payload: true });
  }, []);

  const unMute = useCallback(() => {
    dispatch({ type: ActionTypes.SET_MUTED, payload: false });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: ActionTypes.SET_MUTED, payload: !state.isMuted });
  }, [state.isMuted]);

  /* Seek handlers */

  const setSeeking = useCallback((isSeeking) => {
    dispatch({ type: ActionTypes.SET_SEEKING, payload: isSeeking });
  }, []);

  const setSeekTo = useCallback((seekTo) => {
    dispatch({ type: ActionTypes.SET_SEEK_TO, payload: seekTo });
  }, []);

  const forward = useCallback(() => {
    const seekTo = Math.min(
      state.duration,
      state.currentTime + PLAYBACK_JUMP_MAGNITUDE,
    );
    dispatch({ type: ActionTypes.SET_SEEK_TO, payload: seekTo });
  }, [state.currentTime, state.duration]);

  const rewind = useCallback(() => {
    const seekTo = Math.max(
      0,
      state.currentTime - PLAYBACK_JUMP_MAGNITUDE,
    );
    dispatch({ type: ActionTypes.SET_SEEK_TO, payload: seekTo });
  }, [state.currentTime]);

  /* Duration/Progress handlers */

  const setCurrentTime = useCallback((currentTime) => {
    dispatch({ type: ActionTypes.SET_CURRENT_TIME, payload: currentTime });
  }, []);

  const setDuration = useCallback((duration) => {
    dispatch({ type: ActionTypes.SET_DURATION, payload: duration });
  }, []);

  /* Error handlers */

  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  }, []);

  const setPlayRestricted = useCallback((isPlayRestricted) => {
    dispatch({
      type: ActionTypes.SET_PLAY_RESTRICTED,
      payload: isPlayRestricted,
    });
  }, []);

  /* End handlers */

  const setEnded = useCallback((isEnded) => {
    dispatch({ type: ActionTypes.SET_ENDED, payload: isEnded });
  }, []);

  /* Set volume handlers */

  const setVolume = useCallback((volume) => {
    dispatch({ type: ActionTypes.SET_VOLUME, payload: volume });
  }, []);

  /* Set playback rate handlers */

  const setPlaybackRate = useCallback((playbackRate) => {
    dispatch({ type: ActionTypes.SET_PLAYBACK_RATE, payload: playbackRate });
  }, []);

  /* Fullscreen handlers */

  const enterFullscreen = useCallback(() => {
    dispatch({ type: ActionTypes.SET_FULLSCREEN, payload: true });
  }, []);

  const exitFullscreen = useCallback(() => {
    dispatch({ type: ActionTypes.SET_FULLSCREEN, payload: false });
  }, []);

  const toggleFullscreen = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_FULLSCREEN,
      payload: !state.isFullscreen,
    });
  }, [state.isFullscreen]);

  /** PiP handlers */

  const togglePictureInPicture = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_PICTURE_IN_PICTURE,
      payload: !state.isPiPEnabled,
    });
  }, [state.isPiPEnabled]);

  const setPictureInPicture = useCallback((isPiPEnabled) => {
    dispatch({
      type: ActionTypes.SET_PICTURE_IN_PICTURE,
      payload: isPiPEnabled,
    });
  }, []);

  /* Playlist handlers */

  const setPlaylist = useCallback((playlist, selectedIndex) => {
    const selected = playlist[selectedIndex];
    dispatch({
      type: ActionTypes.SET_PLAYLIST,
      payload: playlist,
    });
    dispatch({
      type: ActionTypes.SET_CURRENT_SRC,
      payload: selected,
    });
  }, []);

  const setVideo = useCallback((src, resumeAt) => {
    // If the same video is already playing just seek to required time
    if (src === state.currentSrc) {
      setSeekTo(resumeAt);
    } else {
      dispatch({ type: ActionTypes.RESET });
      dispatch({
        type: ActionTypes.SET_CURRENT_SRC,
        payload: { resumeAt, src },
      });
    }
  }, [setSeekTo, state.currentSrc]);

  const selectPlaylistVideo = useCallback((src, resumeAt = 0) => {
    dispatch({ type: ActionTypes.SET_PLAYED_FROM_PLAYLIST });
    setVideo(src, resumeAt);
  }, [setVideo]);

  const selectVideo = useCallback((src, resume = true) => {
    const playlistItem = state.playlist.find(o => o.src === src);
    let { resumeAt } = playlistItem;
    if (!resume) {
      resumeAt = 0;
    }

    selectPlaylistVideo(src, resumeAt);
  }, [selectPlaylistVideo, state.playlist]);

  const nextVideo = useCallback(() => {
    if (state.next < 0) {
      return;
    }

    const { src } = state.playlist[state.next];
    dispatch({ type: ActionTypes.SET_PLAYED_FROM_PLAYLIST });
    setVideo(src, 0);
  }, [setVideo, state.next, state.playlist]);

  const openPlaylist = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_PLAYLIST_OPEN,
      payload: true,
    });
  }, []);

  const closePlaylist = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_PLAYLIST_OPEN,
      payload: false,
    });
  }, []);

  const togglePlaylist = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_PLAYLIST_OPEN,
      payload: !state.isPlaylistOpen,
    });
  }, [state.isPlaylistOpen]);

  /* Quick actions */

  const setQuickAction = useCallback((action) => {
    dispatch({
      type: ActionTypes.SET_QUICK_ACTION,
      payload: action,
    });
  }, []);

  const unsetQuickAction = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_QUICK_ACTION,
      payload: null,
    });
  }, []);

  /* Bookmark related actions */

  const addBookmark = useCallback((time) => {
    dispatch({
      type: ActionTypes.SET_BOOKMARK_TIME,
      payload: time,
    });
  }, []);

  const editBookmark = useCallback((bookmark) => {
    clearTimeout(editBookmarkTimer.current);
    editBookmarkTimer.current = setTimeout(() => {
      dispatch({
        type: ActionTypes.SET_EDITING_BOOKMARK,
        payload: bookmark,
      });
    }, bookmark ? 0 : EDIT_BOOKMARK_TIMEOUT);
  }, []);

  const setBookmarkEnabled = useCallback((isEnabled) => {
    dispatch({
      type: ActionTypes.SET_BOOKMARK_ENABLED,
      payload: isEnabled,
    });
  }, []);

  /* Controls enabled/disabled */

  const setHasControls = useCallback((hasControls) => {
    dispatch({
      type: ActionTypes.SET_HAS_CONTROLS,
      payload: hasControls,
    });
  }, []);

  /* Buffer related methods */

  const setBufferedIntervals = useCallback((intervals) => {
    dispatch({
      type: ActionTypes.SET_BUFFERED_INTERVALS,
      payload: intervals,
    });
  }, []);

  // Quality control related methods

  const setQualityLevels = useCallback((levels) => {
    dispatch({
      type: ActionTypes.SET_QUALITY_LEVELS,
      payload: levels,
    });
  }, []);

  const setSelectedQualityLevel = useCallback((level) => {
    dispatch({
      type: ActionTypes.SET_SELECTED_QUALITY_LEVEL,
      payload: level,
    });
  }, []);

  const setAppliedQuality = useCallback((quality) => {
    dispatch({
      type: ActionTypes.SET_APPLIED_QUALITY,
      payload: quality,
    });
  }, []);

  const methods = useMemo(() => ({
    setContainer,
    setLoading,
    setMetaLoaded,
    setPlaying,
    pause,
    play,
    togglePlay,
    mute,
    unMute,
    toggleMute,
    setSeeking,
    setSeekTo,
    forward,
    rewind,
    setCurrentTime,
    setPlayedIntervals,
    setDuration,
    setError,
    setEnded,
    setVolume,
    setPlaybackRate,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    setPlaylist,
    setVideo,
    selectPlaylistVideo,
    selectVideo,
    nextVideo,
    openPlaylist,
    closePlaylist,
    togglePlaylist,
    setQuickAction,
    unsetQuickAction,
    addBookmark,
    editBookmark,
    setHasControls,
    setBufferedIntervals,
    setBookmarkEnabled,
    setQualityLevels,
    setSelectedQualityLevel,
    setAppliedQuality,
    setPlayRestricted,
    setVideoPlayer,
    togglePictureInPicture,
    setPictureInPicture,
  }), [
    setContainer, setLoading, setMetaLoaded, setPlaying, forward, mute, pause,
    play, rewind, setSeekTo, setSeeking, toggleMute, togglePlay, unMute,
    setCurrentTime, setPlayedIntervals, setDuration,
    setError, setEnded, setVolume, setPlaybackRate,
    enterFullscreen, exitFullscreen, toggleFullscreen,
    setPlaylist, setVideo, selectPlaylistVideo, selectVideo, nextVideo,
    openPlaylist, closePlaylist, togglePlaylist, setQuickAction,
    unsetQuickAction, addBookmark, editBookmark, setHasControls,
    setBufferedIntervals, setBookmarkEnabled, setQualityLevels,
    setSelectedQualityLevel, setAppliedQuality, setPlayRestricted,
    setVideoPlayer, togglePictureInPicture, setPictureInPicture,
  ]);

  return (
    <GlobalStateContext.Provider value={{ ...state, ...remainingProps }}>
      <ActionsContext.Provider value={methods}>
        {children}
      </ActionsContext.Provider>
    </GlobalStateContext.Provider>
  );
}

export default Provider;
