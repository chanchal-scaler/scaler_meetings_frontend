import React from 'react';
import compose from 'lodash/fp/compose';

import {
  Adios, Header, Login, SocketConflict, SocketError, WithMeeting,
} from '~meetings/components/modes/live';
import { LoadingLayout } from '@common/ui/layouts';
import { mobxify } from '~meetings/ui/hoc';
import { SocketStatus } from '~meetings/utils/meeting';
import { useHeaderLeftActions } from '@meetings/hooks';
import { withStatusProtection } from '@meetings/ui/hoc';
import Meeting from './Meeting';

function LivePage() {
  const headerLeftActions = useHeaderLeftActions();

  function meetingUi({ meeting }) {
    const { manager } = meeting;

    if (meeting.endType) {
      return <Adios />;
    } else if (!meeting.isLoggedIn) {
      return (
        <>
          <Header leftActions={headerLeftActions} />
          <Login />
        </>
      );
    } else if (!manager) {
      return <LoadingLayout isTransparent />;
    } else if (manager.status === SocketStatus.rejected) {
      return <SocketConflict />;
    } else if (manager.isConnected) {
      return <Meeting />;
    } else if (manager.status === SocketStatus.error) {
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

const hoc = compose(
  withStatusProtection('ongoing'),
  mobxify('meetingStore', 'quizStore'),
);

export default hoc(LivePage);
