import React from 'react';

import { StatusRenderer } from '~meetings/components/modes';
import { WidgetContainer } from '~meetings/components/containers';

function Widget({
  slug,
  status,
  headerLeftActions,
  headerRightActions,
  onEndCallRequest,
  archiveComponent: Archive,
  liveComponent: Live,
  upcomingComponent: Upcoming,
  missingBookmarkActionRenderer,
  onTestSetupRequest,
  ...remainingProps
}) {
  const { liveProps = {} } = remainingProps;
  return (
    <WidgetContainer
      slug={slug}
      status={status}
      headerLeftActions={headerLeftActions}
      headerRightActions={headerRightActions}
      onEndCallRequest={onEndCallRequest}
      missingBookmarkActionRenderer={missingBookmarkActionRenderer}
      onTestSetupRequest={onTestSetupRequest}
    >
      {() => (
        <>
          <StatusRenderer status="upcoming">
            {() => <Upcoming />}
          </StatusRenderer>
          <StatusRenderer status="ongoing">
            {() => <Live {...liveProps} />}
          </StatusRenderer>
          <StatusRenderer status="completed">
            {() => <Archive />}
          </StatusRenderer>
        </>
      )}
    </WidgetContainer>
  );
}

export default Widget;
