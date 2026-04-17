import React from 'react';
import PropTypes from 'prop-types';

import { MeetingStatus } from '~meetings/utils/meeting';
import Upcoming from './Upcoming';
import Live from './Live';
import Archive from './Archive';
import Widget from '~meetings/widgets/Widget';

function FullWidget({
  slug,
  status,
  headerLeftActions,
  headerRightActions,
  onEndCallRequest,
  missingBookmarkActionRenderer,
  onTestSetupRequest,
  ...remainingProps
}) {
  return (
    <Widget
      slug={slug}
      status={status}
      headerLeftActions={headerLeftActions}
      headerRightActions={headerRightActions}
      onEndCallRequest={onEndCallRequest}
      missingBookmarkActionRenderer={missingBookmarkActionRenderer}
      onTestSetupRequest={onTestSetupRequest}
      upcomingComponent={Upcoming}
      liveComponent={Live}
      archiveComponent={Archive}
      {...remainingProps}
    />
  );
}

FullWidget.propTypes = {
  slug: PropTypes.string.isRequired,
  status: PropTypes.oneOf(Object.values(MeetingStatus)),
};

export default FullWidget;
