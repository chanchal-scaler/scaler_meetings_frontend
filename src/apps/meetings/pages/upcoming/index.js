import React from 'react';
import { Link } from 'react-router-dom';
import compose from 'lodash/fp/compose';

import { canPreTestSetup } from '~meetings/utils/meeting';
import { mobxify } from '~meetings/ui/hoc';
import { Tappable } from '@common/ui/general';
import { Upcoming, UpcomingActions } from '~meetings/components/modes/upcoming';
import { useHeaderLeftActions } from '@meetings/hooks';
import { withStatusProtection } from '@meetings/ui/hoc';

function UpcomingPage({ meetingStore: store }) {
  const headerLeftActions = useHeaderLeftActions();

  return (
    <Upcoming
      renderChecklist
      headerActions={headerLeftActions}
    >
      <div className="row flex-c m-t-20">
        <UpcomingActions.CreatePolls className="m-r-10" />
        <UpcomingActions.CreateQuizzes className="m-r-10" />
        {store.isSuperHost && canPreTestSetup(store.data.type) && (
          <Tappable
            className="btn btn-primary"
            component={Link}
            data-cy="meetings-upcoming-test-setup-btn"
            to={{
              pathname: `/i/${store.data.slug}/live`,
              search: '?forced=1',
            }}
          >
            Test Setup
          </Tappable>
        )}
      </div>
    </Upcoming>
  );
}

const hoc = compose(
  withStatusProtection('upcoming'),
  mobxify('meetingStore'),
);

export default hoc(UpcomingPage);
