import React, { useCallback } from 'react';
import classNames from 'classnames';

import {
  DRONA_FEATURES,
  DRONA_SOURCES,
  DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';
import MeetingTabBar from './MeetingTabBar';
import MeetingTabs from './MeetingTabs';

function MobilePanel({ meetingStore: store }) {
  const { meeting } = store;
  const { isMobilePanelExpanded } = meeting;

  const handleToggle = useCallback(() => {
    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaOpenChatClick,
      click_source: DRONA_SOURCES.meetingMobileView,
      click_feature: DRONA_FEATURES.chat,
      custom: {
        is_live: true,
      },
    });
    meeting.setMobilePanelExpanded(!isMobilePanelExpanded);
  }, [isMobilePanelExpanded, meeting]);

  function expandUi() {
    return (
      <Tappable
        className={classNames(
          'btn btn-icon btn-round mobile-panel__expand',
          { 'mobile-panel__expand--active': isMobilePanelExpanded },
        )}
        onClick={handleToggle}
      >
        <Icon name="arrow-up" />
      </Tappable>
    );
  }

  function headerUi() {
    return (
      <div className="mobile-panel__header">
        <MeetingTabBar />
        {expandUi()}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'mobile-panel layout',
        { 'mobile-panel--expanded': isMobilePanelExpanded },
      )}
    >
      {headerUi()}
      <MeetingTabs />
    </div>
  );
}

export default mobxify('meetingStore')(MobilePanel);
