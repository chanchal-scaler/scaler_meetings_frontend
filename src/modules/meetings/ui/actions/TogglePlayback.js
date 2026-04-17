import React from 'react';

import { canShareVideo } from '~meetings/utils/playback';
import { IconButton } from '~meetings/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaQuery } from '@common/hooks/index';

function TogglePlayback({ className, meetingStore: store, ...remainingProps }) {
  const { mobile } = useMediaQuery();
  const { meeting } = store;
  const { playback } = meeting;

  if (
    mobile
    || !meeting.isSuperHost
    || !playback
    || !canShareVideo(meeting.type)
    || !meeting.isGodMode
  ) {
    return null;
  } else {
    return (
      <IconButton
        className={className}
        disabled={playback.isAdded}
        icon="video-add"
        label={playback.isAdded ? 'Video already shared' : 'Share a Video'}
        onClick={() => playback.setCreateModalOpen(true)}
        popoverProps={{
          placement: 'bottom',
        }}
        {...remainingProps}
      />
    );
  }
}

export default mobxify('meetingStore')(TogglePlayback);
