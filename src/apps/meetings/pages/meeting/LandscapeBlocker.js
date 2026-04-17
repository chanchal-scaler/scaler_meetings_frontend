import React from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';

function LandscapeBlocker({ meetingStore: store }) {
  if (!store.isUsingLandscape) {
    return (
      <HintLayout
        className="m-landscape-blocker"
        isTransparent
        message="Landscape mode is not support. Please switch to potrait mode"
      />
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(LandscapeBlocker);
