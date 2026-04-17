import React, { useCallback, useEffect } from 'react';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import { evaluateInWebview } from '@common/utils/webview';
import { mobxify } from '~meetings/ui/hoc';

import analytics from '@common/utils/analytics';

function Fullscreen({ className, layoutStore, meetingStore: store }) {
  const { meeting } = store;

  // Handle going to fullscreen using browser shortcuts like pressing F11
  useEffect(() => {
    function handleFullscreenChange() {
      const isFullscreen = Boolean(document.fullscreenElement);
      meeting.setFullscreen(isFullscreen);
    }

    if (layoutStore.isStandalone) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      );
    }

    return undefined;
  }, [layoutStore.isStandalone, meeting]);

  const handleFullScreenClick = useCallback(() => {
    meeting.toggleFullscreen();
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaFullScreenButtonClick,
      click_source: DRONA_SOURCES.meetingBottomPanel,
      click_text: 'Enter fullscreen',
      click_feature: DRONA_FEATURES.meetingControls,
    });
  }, [meeting]);

  if (evaluateInWebview('hideFullScreenCta')) {
    return null;
  } else {
    return (
      <IconButton
        className={className}
        icon={meeting.isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
        label={meeting.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        gtmEventType="fullscreen_action"
        gtmEventAction="click"
        gtmEventResult={meeting.isFullscreen
          ? 'exit_fullscreen' : 'enter_fullscreen'}
        gtmEventCategory="drona"
        onClick={handleFullScreenClick}
      />
    );
  }
}

export default mobxify('layoutStore', 'meetingStore')(Fullscreen);
