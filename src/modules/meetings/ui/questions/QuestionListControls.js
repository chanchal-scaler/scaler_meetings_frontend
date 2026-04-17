import React, { useCallback } from 'react';

import {
  Dropdown, DropdownItem, Icon, Switch,
} from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { QuestionFilter, QuestionSort } from '~meetings/utils/question';

function QuestionListControls({ meetingStore: store }) {
  const { meeting } = store;

  const questionSortsLabelMap = {
    [QuestionSort.votes]: 'Most upvoted',
    [QuestionSort.date]: 'Recently asked',
  };

  if (meeting.activeQuestionTab === 'completed') {
    questionSortsLabelMap[QuestionSort.date] = 'Recently answered';
  }

  const handleFilterChange = useCallback((event) => {
    if (event.target.checked) {
      meeting.setQuestionFilter(QuestionFilter.mine);
    } else {
      meeting.setQuestionFilter(QuestionFilter.all);
    }
  }, [meeting]);

  function titleUi({ isOpen }) {
    return (
      <>
        <Icon name="filter-alt" />
        <span className="m-h-5">
          {questionSortsLabelMap[meeting.questionSort]}
        </span>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} />
      </>
    );
  }

  return (
    <div className="mq-list-controls">
      <div className="mq-list-controls__left">
        {!meeting.isSuperHost && (
          <div className="mq-list-controls__filters">
            <Switch
              checked={meeting.questionFilter === QuestionFilter.mine}
              className="m-r-5"
              onChange={handleFilterChange}
              small
            />
            <span>My questions</span>
          </div>
        )}
      </div>
      <div className="mq-list-controls__right">
        <div className="mq-list-controls__sorts">
          <Dropdown
            className="mq-list-controls__dropdown"
            popoverProps={{
              location: { top: '110%', right: 0 },
            }}
            title={titleUi}
            titleClassName="
              mq-list-controls__sort mq-list-controls__sort--selected
            "
          >
            {Object.values(QuestionSort).map((sort) => (
              <DropdownItem
                key={sort}
                className="mq-list-controls__sort"
                onClick={() => meeting.setQuestionSort(sort)}
              >
                {questionSortsLabelMap[sort]}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

export default mobxify('meetingStore')(QuestionListControls);
