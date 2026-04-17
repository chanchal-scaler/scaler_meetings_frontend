import React from 'react';

import {
  ArchiveContainer,
  Header,
  MainActivity,
  MainContainer,
  Sidebar,
  WithArchive,
} from '~meetings/components/modes/archive';
import { useWidgetData } from '~meetings/hooks';
import {
  HEADER_ACTION_TYPE, getHeaderActions,
} from '~meetings/utils/headerActions';

function Archive() {
  const { headerLeftActions } = useWidgetData();

  const leftHeaderActions = getHeaderActions(
    headerLeftActions, HEADER_ACTION_TYPE.archive,
  );

  return (
    <WithArchive headerActions={leftHeaderActions}>
      {() => (
        <ArchiveContainer>
          <MainContainer>
            <Header leftActions={leftHeaderActions} />
            <MainActivity />
          </MainContainer>
          <Sidebar />
        </ArchiveContainer>
      )}
    </WithArchive>
  );
}

export default Archive;
