import React from 'react';
import classNames from 'classnames';

import { canCreatePollAndQuiz } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { PollHQ } from '~meetings/ui/poll_admin';
import { Tappable } from '@common/ui/general';

function CreatePolls({
  className,
  meetingStore: store,
  pollStore,
  ...remainingProps
}) {
  if (store.isSuperHost && canCreatePollAndQuiz(store.data.type)) {
    return (
      <>
        <Tappable
          className={classNames(
            'btn btn-primary m-r-10',
            { [className]: className },
          )}
          data-cy="meetings-upcoming-create-poll-btn"
          onClick={() => pollStore.setHQOpen(true)}
          {...remainingProps}
        >
          Create Polls
        </Tappable>
        <PollHQ />
      </>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'pollStore')(CreatePolls);
