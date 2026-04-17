import React from 'react';

import {
  DRONA_FEATURES, DRONA_SOURCES, DRONA_TRACKING_TYPES,
} from '~meetings/utils/trackingEvents';
import { mobxify } from '~meetings/ui/hoc';
import { SegmentedControl, SegmentedControlOption } from '@common/ui/general';
import { Select } from '~meetings/ui/general';
import { useMediaQuery } from '@common/hooks';
import analytics from '@common/utils/analytics';

const questionTabs = [{
  name: 'active',
  label: 'Live',
}, {
  name: 'completed',
  label: 'Answered',
}];

function QuestionTabBar({ meetingStore: store }) {
  const { mobile } = useMediaQuery();
  const { meeting } = store;

  const questionsCount = {
    active: meeting.activeQuestions.length,
    completed: meeting.completedQuestions.length,
  };

  const handleTabChange = (value) => {
    meeting.setActiveQuestionTab(value);

    analytics.click({
      click_type: DRONA_TRACKING_TYPES.dronaSwitchQuestionTab,
      click_source: DRONA_SOURCES.meetingQuestionView,
      click_feature: DRONA_FEATURES.questions,
      custom: {
        tab_name: value,
      },
    });
  };

  if (mobile) {
    return (
      <Select
        className="mq-tabbar"
        name="activeQuestionTab"
        onChange={event => handleTabChange(event.target.value)}
        small
        value={meeting.activeQuestionTab}
      >
        {questionTabs.map((item) => (
          <Select.Option
            key={item.name}
            value={item.name}
          >
            {item.label}
            {' '}
            (
            {questionsCount[item.name]}
            )
          </Select.Option>
        ))}
      </Select>
    );
  } else {
    return (
      <SegmentedControl
        className="mq-tabbar"
        onChange={handleTabChange}
        value={meeting.activeQuestionTab}
      >
        {questionTabs.map((item) => (
          <SegmentedControlOption
            key={item.name}
            className="mq-tabbar__title"
            name={item.name}
          >
            {item.label}
            {' '}
            (
            {questionsCount[item.name]}
            )
          </SegmentedControlOption>
        ))}
      </SegmentedControl>
    );
  }
}

export default mobxify('meetingStore')(QuestionTabBar);
