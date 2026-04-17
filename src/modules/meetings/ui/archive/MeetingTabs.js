import React from 'react';

import { ArchiveBookmarks } from '~meetings/ui/bookmarks';
import { mobxify } from '~meetings/ui/hoc';
import Attachments from './Attachments';
import Chat from './Chat';
import NoticeBoard from '~meetings/ui/notice_board';

function MeetingTabs({ meetingStore: store }) {
  const { archive } = store;

  switch (archive.activeTab) {
    case 'chat':
      return (
        <div className="archive-layout layout">
          <Chat />
        </div>
      );
    case 'bookmarks':
      return <ArchiveBookmarks />;
    case 'attachments':
      return <Attachments />;
    case 'notice_board':
      return <NoticeBoard />;
    default:
      return null;
  }
}

export default mobxify('meetingStore')(MeetingTabs);
