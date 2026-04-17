import React from 'react';

import { LiveBookmarks } from '~meetings/ui/bookmarks';
import { MEETING_TABS } from '~meetings/utils/constants';
import { mobxify } from '~meetings/ui/hoc';
import { Participants } from '~meetings/ui/participants';
import { Playlist } from '~meetings/ui/playlist';
import { TabPluginsRenderer } from '~meetings/plugins/components';
import ExternalLinks from '~meetings/ui/external_links';
import MessagingChannel from './MessagingChannel';
import Notes from '~meetings/ui/Notes';
import NoticeBoard from '~meetings/ui/notice_board';
import Questions from '~meetings/ui/questions';


function MeetingTabs({ meetingStore: store, pluginsStore }) {
  const { meeting } = store;

  function tabUi() {
    switch (meeting.activeTab) {
      case MEETING_TABS.chat:
        return <MessagingChannel />;
      case MEETING_TABS.notes:
        return <Notes />;
      case MEETING_TABS.people:
        return <Participants />;
      case MEETING_TABS.questions:
        return <Questions />;
      case MEETING_TABS.bookmarks:
        return <LiveBookmarks />;
      case MEETING_TABS.playlist:
        return <Playlist />;
      case MEETING_TABS.noticeBoard:
        return <NoticeBoard />;
      case MEETING_TABS.externalLinks:
        return <ExternalLinks />;
      default:
        return null;
    }
  }

  return (
    <>
      {tabUi()}
      <TabPluginsRenderer plugins={pluginsStore.tabPlugins} />
    </>
  );
}

export default mobxify('meetingStore', 'pluginsStore')(MeetingTabs);
