import React, { useEffect } from 'react';

import { mobxify } from '~meetings/ui/hoc';
import AlertIcon from '~meetings/images/alert-triangle-dark.svg';

function BookmarkReminder({ meetingStore: store }) {
  const { meeting } = store;

  useEffect(() => {
    meeting.loadBookmarks();
  }, [meeting]);

  return (
    !meeting.isLoadingBookmarks && !meeting.hasBookmarks && (
      <div className="adios__bookmark">
        <img
          className="adios__bookmark-icon"
          src={AlertIcon}
          alt="alert"
        />
        <div className="adios__bookmark-title">
          This class has bookmarks missing. Please add bookmarks.
        </div>
      </div>
    )
  );
}

export default mobxify('meetingStore')(BookmarkReminder);
