import React from 'react';

import { Icon, Tappable } from '@common/ui/general';
import { MeetingTabs, RightDock } from '~meetings/ui/archive';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaQuery } from '@common/hooks';
import SidebarContainer from '~meetings/ui/SidebarContainer';

const tabsLabelMap = {
  chat: 'Chat',
  bookmarks: 'Bookmarks',
  attachments: 'Lecture Notes',
  notice_board: 'Notice Board',
};

function Sidebar({ meetingStore: store }) {
  const { archive } = store;
  const { tablet } = useMediaQuery();

  function closeUi() {
    return (
      <Tappable
        className="btn btn-icon btn-round m-sidebar__close"
        onClick={() => archive.setActiveTab(null)}
      >
        <Icon name="clear" />
      </Tappable>
    );
  }

  function headerUi() {
    return (
      <div className="m-sidebar__header">
        <div className="m-sidebar__options">
          <div className="h3 bold dark full-width">
            {tabsLabelMap[archive.activeTab]}
          </div>
        </div>
        {closeUi()}
      </div>
    );
  }

  if (!tablet) {
    return (
      <div className="archive-sidebar">
        <SidebarContainer
          isOpen={Boolean(archive.activeTab)}
        >
          {headerUi()}
          <MeetingTabs />
        </SidebarContainer>
        <RightDock />
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(Sidebar);
