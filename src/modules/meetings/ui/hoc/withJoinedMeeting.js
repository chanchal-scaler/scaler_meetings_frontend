import React, { useEffect } from 'react';

import { FillLayout, HintLayout, LoadingLayout } from '@common/ui/layouts';
import mobxify from './mobxify';

function withJoinedMeeting(BaseComponent) {
  function WithJoinedMeeting({ meetingStore: store, ...remainingProps }) {
    const { meeting } = store;

    // eslint-disable-next-line no-console
    console.log('[meetings:withJoinedMeeting]', {
      isLoggedIn: meeting.isLoggedIn,
      isLoading: meeting.isLoading,
      isJoined: meeting.isJoined,
      hasLoadError: Boolean(meeting.loadError),
      loadErrorMessage: meeting.loadError?.message,
    });

    useEffect(() => {
      meeting.initialise();

      return () => meeting.destroy();
    }, [meeting]);

    if (meeting.isLoading) {
      return <LoadingLayout isTransparent />;
    } else if (meeting.loadError) {
      return (
        <HintLayout
          isTransparent
          message="Failed to join meeting"
          actionLabel="Try again"
          actionFn={() => meeting.loadSession()}
        />
      );
    } else if (meeting.isJoined) {
      return <BaseComponent {...remainingProps} />;
    } else {
      return <FillLayout type="flex-fill" />;
    }
  }

  return mobxify('meetingStore')(WithJoinedMeeting);
}

export default withJoinedMeeting;
