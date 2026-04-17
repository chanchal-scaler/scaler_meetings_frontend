import React, { useCallback } from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { Switch } from '@common/ui/general';

function ArchiveBookmarkFilter({ meetingStore: store }) {
  const { archive } = store;
  const handleSwitchChange = useCallback(
    (event) => {
      if (event.target.checked) {
        archive.setShowQuestions(true);
      } else {
        archive.setShowQuestions(false);
      }
    },
    [archive],
  );

  if (archive.hasQuestionBookmarks) {
    return (
      <div className="row align-c flex-jc p-h-20 m-v-5">
        <span className="m-r-5 h5 hint no-mgn-b">
          Show Questions
        </span>
        <Switch
          activeColor="$primary-color"
          checked={archive.showQuestions}
          onChange={handleSwitchChange}
          small
        />
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(ArchiveBookmarkFilter);
