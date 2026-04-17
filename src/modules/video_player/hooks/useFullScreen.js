import { useCallback } from 'react';

import * as Browser from '@common/utils/browser';
import { isIOS } from '@common/utils/platform';
import useActions from './useActions';
import useGlobalState from './useGlobalState';


function useFullScreen() {
  const { toggleFullscreen } = useActions();

  const { videoPlayerEl, containerEl, isFullscreen } = useGlobalState();

  const handleFullScreen = useCallback(() => {
    /**
     * iOS does not support container fullscreen.
     */
    const el = isIOS() ? videoPlayerEl : containerEl;

    if (isFullscreen) {
      Browser.exitFullscreen(el);
    } else {
      Browser.enterFullscreen(el);
    }
    toggleFullscreen();
  }, [containerEl, isFullscreen, toggleFullscreen, videoPlayerEl]);

  return handleFullScreen;
}

export default useFullScreen;
