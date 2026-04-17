import React from 'react';
import classNames from 'classnames';

import { LoadingLayout } from '@common/ui/layouts';
import {
  Adios,
  Footer,
  LiveContainer,
  Login,
  MainContainer,
  SocketConflict,
  SocketError,
  VideoChannel,
  WithMeeting,
} from '~meetings/components/modes/live';
import { SocketStatus } from '~meetings/utils/meeting';

function debugLog(payload) {
  // eslint-disable-next-line no-console
  console.log('[meetings:call-live-branch]', payload);
}

function Live() {
  function meetingUi({ meeting }) {
    const { manager } = meeting;
    const managerStatus = manager?.status;
    const managerConnected = Boolean(manager?.isConnected);
    const shouldRenderLive = meeting.isJoined || managerConnected;

    debugLog({
      isLoggedIn: meeting.isLoggedIn,
      isJoined: meeting.isJoined,
      isLoading: meeting.isLoading,
      hasLoadError: Boolean(meeting.loadError),
      managerStatus,
      managerConnected,
      shouldRenderLive,
    });

    if (meeting.endType) {
      return <Adios />;
    } else if (!meeting.isLoggedIn) {
      return <Login />;
    } else if (shouldRenderLive) {
      return (
        <LiveContainer
          className={classNames(
            { 'meeting--fullscreen': meeting.isFullscreen },
          )}
        >
          {() => (
            <MainContainer>
              <VideoChannel />
              <Footer variant="compact" />
            </MainContainer>
          )}
        </LiveContainer>
      );
    } else if (managerStatus === SocketStatus.rejected) {
      return <SocketConflict />;
    } else if (managerStatus === SocketStatus.error) {
      return <SocketError />;
    } else {
      return <LoadingLayout isTransparent />;
    }
  }

  return (
    <WithMeeting>
      {meetingUi}
    </WithMeeting>
  );
}

export default Live;
