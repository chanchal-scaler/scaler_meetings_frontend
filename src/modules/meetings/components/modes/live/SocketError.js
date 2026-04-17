import React from 'react';

import { HintLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';

function SocketError({ meetingStore: store }) {
  const { meeting } = store;
  const { manager } = meeting;

  return (
    <HintLayout
      isTransparent
      message="Unable to connect to the server. Please try again"
      actionLabel="Try again"
      actionFn={manager.load}
    />
  );
}

export default mobxify('meetingStore')(SocketError);
