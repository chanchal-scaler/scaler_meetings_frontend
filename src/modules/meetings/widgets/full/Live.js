import React from 'react';

import {
  Adios,
  Footer,
  Header,
  LiveContainer,
  Login,
  MainActivity,
  MainContainer,
  Sidebar,
  SocketConflict,
  SocketError,
  WithMeeting,
} from '~meetings/components/modes/live';
import { HEADER_ACTION_TYPE, getHeaderActions }
  from '~meetings/utils/headerActions';
import { LoadingLayout } from '@common/ui/layouts';
import { SocketStatus } from '~meetings/utils/meeting';
import { useWidgetData } from '~meetings/hooks';
import CustomHeaderActions from '~meetings/ui/CustomHeaderActions';
import Playlist from '~meetings/ui/playlist/Playlist';

function debugLog(payload) {
  // eslint-disable-next-line no-console
  console.log('[meetings:live-branch]', payload);
}

function Live({ adiosProps = {} }) {
  const { headerLeftActions, headerRightActions } = useWidgetData();

  const leftHeaderActions = getHeaderActions(headerLeftActions, HEADER_ACTION_TYPE.live);
  const rightHeaderActions = getHeaderActions(headerRightActions, HEADER_ACTION_TYPE.live);

  function meetingUi({ meeting }) {
    const { manager } = meeting;
    const managerStatus = manager?.status;
    const managerConnected = Boolean(manager?.isConnected);
    const shouldRenderLive = meeting.isJoined || managerConnected;
    let route = 'loading';
    if (!meeting.isLoggedIn) {
      route = 'login';
    } else if (shouldRenderLive) {
      route = 'live';
    } else if (managerStatus === SocketStatus.rejected) {
      route = 'socket-conflict';
    } else if (managerStatus === SocketStatus.error) {
      route = 'socket-error';
    }

    debugLog({
      isLoggedIn: meeting.isLoggedIn,
      endType: meeting.endType,
      managerStatus,
      isConnected: managerConnected,
      shouldRenderLive,
      isRejected: managerStatus === SocketStatus.rejected,
      isError: managerStatus === SocketStatus.error,
      route,
    });

    if (meeting.endType) {
      return (
        <div className="column flex-fill">
          <div className="row m-l-5 m-t-5">
            <CustomHeaderActions
              actions={leftHeaderActions}
              mode="live"
            />
          </div>
          <Adios {...adiosProps} />
        </div>
      );
    } else if (!meeting.isLoggedIn) {
      return (
        <>
          <Header leftActions={leftHeaderActions} />
          <Login />
        </>
      );
    } else if (shouldRenderLive) {
      return (
        <LiveContainer
          className="layout__content layout__content--transparent"
          renderSingletons
        >
          {() => (
            <>
              <MainContainer>
                <Header
                  leftActions={leftHeaderActions}
                  rightActions={rightHeaderActions}
                />
                <MainActivity />
                <Playlist />
                <Footer />
              </MainContainer>
              <Sidebar />
            </>
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
      {(props) => (
        <div className="live layout">
          {meetingUi(props)}
        </div>
      )}
    </WithMeeting>
  );
}

export default Live;
