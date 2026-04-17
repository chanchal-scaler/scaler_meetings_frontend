import { useEffect } from 'react';

import HotKey from '@common/lib/hotKey';
import useActions from './useActions';
import useControlsFallback from './useControlsFallback';
import useGlobalState from './useGlobalState';
import useFullScreen from './useFullScreen';

const inputTags = ['input', 'textarea'];

function useShortcuts() {
  const {
    forward,
    nextVideo,
    rewind,
    setQuickAction,
    toggleFullscreen,
    toggleMute,
    togglePlay,
    togglePlaylist,
  } = useActions();

  const {
    disableShortcuts,
    isMuted,
    isPlaying,
  } = useGlobalState();

  const isFallback = useControlsFallback();

  const handleFullScreen = useFullScreen();

  useEffect(() => {
    function handleKeyDown(event) {
      const { target } = event;
      // Don't do anything is keyboard event occurs on an input element
      if (
        inputTags.includes(target.tagName.toLowerCase())
        || target.isContentEditable
      ) {
        return;
      }

      const hotKey = new HotKey(event);

      hotKey.on('f', handleFullScreen);

      hotKey.on('space', () => {
        togglePlay();
        setQuickAction(isPlaying ? 'pause' : 'play');
      });

      hotKey.on('m', () => {
        toggleMute();
        setQuickAction(isMuted ? 'unmute' : 'mute');
      });

      hotKey.on('left', () => {
        rewind();
        setQuickAction('rewind');
      });

      hotKey.on('right', () => {
        forward();
        setQuickAction('forward');
      });

      hotKey.on('n', () => {
        nextVideo();
        setQuickAction('next');
      });

      hotKey.on('p', togglePlaylist);

      const executed = hotKey.execute();
      if (executed) {
        event.preventDefault();
      }
    }

    if (disableShortcuts || isFallback) {
      return undefined;
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    disableShortcuts, forward, isFallback, isMuted, isPlaying, nextVideo,
    rewind, setQuickAction, toggleFullscreen, toggleMute, togglePlay,
    togglePlaylist, handleFullScreen,
  ]);
}

export default useShortcuts;
