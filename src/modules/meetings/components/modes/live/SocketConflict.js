import React from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { STRINGS } from '~meetings/utils/constants';

function SocketConflict({ meetingStore: store }) {
  const { meeting } = store;

  return (
    <HintLayout
      isTransparent
      message={STRINGS.multipleLogin}
      actionLabel="Try Again"
      actionFn={meeting.reload}
    />
  );
}

export default mobxify('meetingStore')(SocketConflict);
