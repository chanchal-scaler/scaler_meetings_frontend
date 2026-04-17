import React, { useCallback, useEffect } from 'react';

import { AudioInput, AVPreview, VideoInput } from '~meetings/ui/media';
import { mobxify } from '~meetings/ui/hoc';
import { Tappable } from '@common/ui/general';

function AudioVideoPromptBody({ mediaStore, meetingStore: store }) {
  const { meeting } = store;
  const { hasMinimumHostAVRequirements } = mediaStore;

  const handleProceed = useCallback(() => {
    if (hasMinimumHostAVRequirements) {
      meeting.onBroadcastSetupComplete();
    }
  }, [hasMinimumHostAVRequirements, meeting]);

  useEffect(() => {
    mediaStore.setEnabledHardware({ video: true, audio: true });
    mediaStore.requestPermissions();
  }, [mediaStore]);

  return (
    <div className="default-font">
      <AVPreview />
      <VideoInput className="m-t-20" />
      <AudioInput />
      <Tappable
        className="btn btn-primary full-width m-t-10"
        disabled={!hasMinimumHostAVRequirements}
        onClick={handleProceed}
      >
        Proceed
      </Tappable>
    </div>
  );
}

export default mobxify('mediaStore', 'meetingStore')(AudioVideoPromptBody);
