import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import { IconButton } from '~meetings/ui/general';
import {
  INITIAL_NUDGE_TIMEOUT, NUDGE_VISIBILITY_TIMEOUT,
} from '~meetings/utils/platformFeedback';
import { MEETING_ACTION_TRACKING } from '~meetings/utils/constants';
import { mobxify } from '~meetings/ui/hoc';
import { Popover } from '@common/ui/general/';
import { useCollapsable } from '@common/hooks';
import { VIEW_TYPES } from '@vectord/analytics';
import analytics from '@common/utils/analytics';
import PlatformFeedbackForm
  from '~meetings/ui/platform_feedback/PlatformFeedbackForm';

function PlatformFeedback({ meetingStore }) {
  const ref = useRef(null);
  const [isTooltipOpen, setTooltipOpen] = useState(false);
  const [isVisible, onClose] = useCollapsable({
    key: 'meeting-platform-feedback',
    numCloses: 1,
  });
  const { meeting } = meetingStore;
  const { manager } = meeting;

  const isPlatformFeedbackOpen = manager && manager.isPlatformFeedbackOpen;

  const handlePlatformFeedbackToggle = useCallback(() => {
    meeting.trackEvent(
      MEETING_ACTION_TRACKING.platformFeedbackOpened,
    );
    analytics.view({
      view_name: DRONA_TRACKING_TYPES.platformFeedbackOpened,
      view_type: VIEW_TYPES.modal,
      view_feature: DRONA_FEATURES.platformFeedback,
      view_source: DRONA_SOURCES.meetingTopNavBar,
    });
    manager.setPlatformFeedbackOpen(!isPlatformFeedbackOpen);
    setTooltipOpen(false);
  }, [isPlatformFeedbackOpen, manager, meeting]);

  const handlePlatformFeedbackClose = useCallback(() => {
    manager.setPlatformFeedbackOpen(false);
    setTooltipOpen(false);
  }, [manager]);

  useEffect(() => {
    // timeout for the tooltip to appear first on drona
    let initialTimeout = null;
    // time for which the tooltip will stay on screen
    let visibilityTimeout = null;

    initialTimeout = setTimeout(() => {
      setTooltipOpen(true);
      visibilityTimeout = setTimeout(() => {
        setTooltipOpen(false);
        onClose();
      }, NUDGE_VISIBILITY_TIMEOUT);
    }, INITIAL_NUDGE_TIMEOUT);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(visibilityTimeout);
    };
  }, [onClose]);

  const isFeedbackButtonVisible = manager
    && manager.isConnected
    && meeting.feedbackForms // only showing if feedback forms are present
    && meeting.feedbackForms.length > 0;

  if (isFeedbackButtonVisible) {
    return (
      <>
        <IconButton
          ref={ref}
          className="m-header__action"
          icon="thumbs-up"
          label="Rate Platform Experience"
          popoverProps={{
            placement: 'bottom',
            margin: { top: 5 },
          }}
          data-cy="meetings-feedback-button"
          gtmEventType="platform_feedback_action"
          gtmEventAction="click"
          gtmEventResult={isPlatformFeedbackOpen
            ? 'close_platform_feedback' : 'open_platform_feedback'}
          gtmEventCategory="drona"
          onClick={handlePlatformFeedbackToggle}
        />
        {/* Below Popover shows the controlled tooltip on feedback button */}
        <Popover
          isOpen={isTooltipOpen && isVisible}
          anchorRef={ref}
          placement="bottom"
          margin={{ top: 5 }}
          className="tooltip"
          extraScope="meeting-app"
        >
          Rate Platform Experience
        </Popover>
        {/* Below Popover shows the feedback form and its stages */}
        <Popover
          isOpen={isPlatformFeedbackOpen}
          anchorRef={ref}
          placement="bottom"
          className="m-platform-feedback-popover"
          extraScope="meeting-app"
          margin={{ top: 10, left: -200 }}
        >
          <PlatformFeedbackForm
            meeting={meeting}
            onClose={handlePlatformFeedbackClose}
          />
        </Popover>
      </>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(PlatformFeedback);
