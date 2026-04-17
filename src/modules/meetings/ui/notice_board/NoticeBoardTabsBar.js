import React from 'react';

import {
  DRONA_FEATURES, DRONA_TRACKING_TYPES,
  DRONA_SOURCES,
} from '~meetings/utils/trackingEvents';
import {
  SegmentedControl,
  SegmentedControlOption,
} from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import analytics from '@common/utils/analytics';

function NoticeBoardTabsBar({ meetingStore: store }) {
  const { meeting } = store;
  const noticeBoardTabs = [{
    name: 'general',
    label: 'General Notice',
  }, {
    name: 'template',
    label: 'Scaler Templates',
  }];

  const handleTabChange = (value) => {
    meeting.setActiveNoticeBoardTab(value);

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaNoticeBoardTabToggleClick,
      click_source: DRONA_SOURCES.meetingNoticeBoardModal,
      click_feature: DRONA_FEATURES.noticeBoard,
      custom: {
        tab_name: value,
      },
    });
  };

  return (
    <SegmentedControl
      className="m-notice-board-tabs-bar"
      activeClassName="m-notice-board-tabs-bar--active"
      onChange={handleTabChange}
      value={meeting.activeNoticeBoardTab}
    >
      {noticeBoardTabs.map((item) => (
        <SegmentedControlOption
          key={item.name}
          className="m-notice-board-tabs-bar__title"
          name={item.name}
        >
          {item.label}
        </SegmentedControlOption>
      ))}
    </SegmentedControl>
  );
}

export default mobxify('meetingStore')(NoticeBoardTabsBar);
