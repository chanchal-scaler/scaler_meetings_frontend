import React, { useCallback, useEffect } from 'react';

import { AudioInput } from '~meetings/ui/media';
import { mobxify } from '~meetings/ui/hoc';
import { Tappable } from '@common/ui/general';

function UnmutePromptBody({ mediaStore, meetingStore: store }) {
  const { meeting } = store;
  const { hasMinimumHostAVRequirements } = mediaStore;

  const requestAudioPermissions = useCallback(() => {
    mediaStore.setEnabledHardware({ audio: true });
    mediaStore.requestPermissions();
  }, [mediaStore]);

  useEffect(() => {
    requestAudioPermissions();
  }, [requestAudioPermissions]);

  const handleProceed = useCallback(() => {
    // To make sure that camera is not started
    mediaStore.setEnabledHardware({ audio: true });
    meeting.setJoinMode('audio', true);
    meeting.setJoinMode('video', false);
    meeting.onBroadcastSetupComplete();
  }, [mediaStore, meeting]);

  const handleClose = useCallback(() => {
    meeting.setBroadcastSetupMode(null);
  }, [meeting]);

  return (
    <div className="default-font">
      <p className="m-b-20 text-c">
        The host has granted you permission to unmute yourself. Would you
        like to unmute yourself?
        {!mediaStore.hasAudioPermissions && (
          <Tappable
            className="btn btn-inverted btn-primary btn-small"
            onClick={requestAudioPermissions}
          >
            Request Microphone Permission
          </Tappable>
        )}
      </p>
      <AudioInput />
      <div className="row">
        <Tappable
          className="btn btn-outlined flex-fill m-r-10"
          onClick={handleClose}
        >
          No, Cancel
        </Tappable>
        <Tappable
          className="btn btn-primary flex-fill"
          disabled={!hasMinimumHostAVRequirements}
          onClick={handleProceed}
        >
          Yes, Unmute myself
        </Tappable>
      </div>
    </div>
  );
}

export default mobxify(
  'mediaStore',
  'meetingStore',
  'settingsStore',
)(UnmutePromptBody);
