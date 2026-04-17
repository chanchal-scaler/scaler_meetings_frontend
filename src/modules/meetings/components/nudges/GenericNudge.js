import React, { useCallback, useEffect } from 'react';
import { isFunction } from 'lodash';

import {
  DRONA_SOURCES, DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Icon, Popover, Tappable } from '@common/ui/general';
import { isMobile } from '@common/utils/platform';
import {
  NUDGE_FEATURE, removeNudgeFromView,
} from '~meetings/utils/genericNudge';
import { VIEW_TYPES } from '@vectord/analytics';
import analytics from '@common/utils/analytics';

function GenericNudge({
  nudgeType, title, description, ctaTitle, ctaCallback, closeAfter = 5,
  popoverRef,
}) {
  useEffect(() => {
    const autoCloseTimeout = setTimeout(() => {
      removeNudgeFromView();
    }, closeAfter * 1000);

    return () => clearTimeout(autoCloseTimeout);
  }, [closeAfter]);

  const handleClose = useCallback(() => {
    removeNudgeFromView();
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaGenericNudgeClosed,
      click_feature: NUDGE_FEATURE[nudgeType],
      click_source: DRONA_SOURCES.onDronaNudges,
      custom: { nudgeType },
    });
  }, [nudgeType]);

  const handleClick = useCallback(() => {
    if (isFunction(ctaCallback)) {
      ctaCallback();
    }
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaGenericNudgeInteracted,
      click_feature: NUDGE_FEATURE[nudgeType],
      click_source: DRONA_SOURCES.onDronaNudges,
      custom: { nudgeType },
    });
  }, [ctaCallback, nudgeType]);

  useEffect(() => {
    analytics.view({
      view_name: DRONA_TRACKING_TYPES.dronaGenericNudgeView,
      view_type: VIEW_TYPES.modal,
      view_feature: NUDGE_FEATURE[nudgeType],
      view_source: DRONA_SOURCES.onDronaNudges,
      custom: { nudgeType },
    });
  }, [nudgeType]);

  return (
    <Popover
      isOpen
      anchorRef={popoverRef}
      onClose={handleClose}
      className="m-engagement-container"
      extraScope="meeting-app"
      location={{ top: 16, right: isMobile() ? 24 : 16 }}
    >
      <div className="m-engagement-nudge-heading">
        {title}
        <Tappable
          className="no-highlight"
          component={Icon}
          name="close"
          onClick={removeNudgeFromView}
        />
      </div>
      <div className="m-engagement-nudge-description">
        {description}
      </div>
      {ctaTitle && (
        <Tappable
          className="m-engagement-nudge-cta no-highlight"
          onClick={handleClick}
        >
          {ctaTitle}
        </Tappable>
      )}
    </Popover>
  );
}

export default GenericNudge;
