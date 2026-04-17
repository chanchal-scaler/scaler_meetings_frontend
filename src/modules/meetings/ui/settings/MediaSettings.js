import React, { useEffect } from 'react';
import compose from 'lodash/fp/compose';

import {
  AudioInput, AudioOutput, VideoInput, SpeakerTest, VideoPreview,
} from '~meetings/ui/media';
import { HintLayout, LoadingLayout } from '@common/ui/layouts';
import { isChrome } from '@common/utils/platform';
import { mobxify, withPermissions } from '~meetings/ui/hoc';

function MediaSettings({ mediaStore: store, mode }) {
  useEffect(() => {
    store.loadDevices();
    // eslint-disable-next-line
  }, []);

  function noDevicesUi() {
    return (
      <HintLayout
        isFit
        message="No camera/microphone found on your device"
      />
    );
  }

  function inputUi() {
    switch (mode) {
      case 'video':
        return (
          <>
            <VideoPreview />
            <VideoInput showHint={!isChrome()} className="m-t-20" />
          </>
        );
      default:
        return (
          <>
            <AudioInput showHint={!isChrome()} />
            <SpeakerTest />
            <AudioOutput />
          </>
        );
    }
  }

  function ui() {
    if (store.audioInputs.length === 0 && store.videoInputs.length === 0) {
      return noDevicesUi();
    } else {
      return (
        <div className="form">
          {inputUi()}
        </div>
      );
    }
  }

  if (store.mediaDevices.length > 0) {
    return ui();
  } else if (store.isLoading) {
    return <LoadingLayout isFit />;
  } else if (store.loadError) {
    return (
      <HintLayout
        isFit
        message="Failed to load available input devices"
        actionLabel="Try again"
        actionFn={() => store.load()}
      />
    );
  } else {
    return noDevicesUi();
  }
}

const hoc = compose(
  withPermissions,
  mobxify('mediaStore'),
);

export default hoc(MediaSettings);
