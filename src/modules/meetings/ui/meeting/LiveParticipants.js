import React from 'react';
import classNames from 'classnames';

import { Icon } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';

function LiveParticipants({ className, meetingStore }) {
  const { meeting } = meetingStore;
  const { manager } = meeting;

  if (
    meeting.canSeeParticipantCount
    && manager
    && manager.onlineUserCount > 1
  ) {
    return (
      <div
        className={classNames(
          'row align-c m-h-10',
          { [className]: className },
        )}
        data-cy="meetings-live-participants-count"
      >
        <Icon
          className="h3 m-r-5"
          name="group"
        />
        <span className="h5 no-mgn-b">
          {manager.onlineUserCount}
          {' '}
          <span className="hide-in-tablet">
            people joined
          </span>
        </span>
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(LiveParticipants);
