import React from 'react';

import { canPreTestSetup } from '~meetings/utils/meeting';
import { HEADER_ACTION_TYPE, getHeaderActions }
  from '~meetings/utils/headerActions';
import { mobxify } from '~meetings/ui/hoc';
import { Tappable } from '@common/ui/general';
import {
  Upcoming as UpcomingContainer,
  UpcomingActions,
} from '~meetings/components/modes/upcoming';
import { useWidgetData } from '~meetings/hooks';

function Upcoming({ meetingStore: store }) {
  const { headerLeftActions, onTestSetupRequest } = useWidgetData() || {};

  const leftHeaderActions = getHeaderActions(
    headerLeftActions, HEADER_ACTION_TYPE.upcoming,
  );

  return (
    <UpcomingContainer renderChecklist headerActions={leftHeaderActions}>
      <div className="row flex-c m-t-20">
        <UpcomingActions.CreatePolls className="m-r-10" />
        <UpcomingActions.CreateQuizzes className="m-r-10" />
        {onTestSetupRequest
          && store.isSuperHost
          && canPreTestSetup(store.data.type) && (
          <Tappable
            className="btn btn-primary"
            data-cy="meetings-test-setup-button"
            onClick={() => onTestSetupRequest()}
          >
            Test Setup
          </Tappable>
        )}
      </div>
    </UpcomingContainer>
  );
}

export default mobxify('meetingStore')(Upcoming);
