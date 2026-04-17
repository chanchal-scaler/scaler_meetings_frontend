import React from 'react';

import {
  ArchiveContainer,
  Header,
  MainActivity,
  MainContainer,
  Sidebar,
  WithArchive,
} from '~meetings/components/modes/archive';
import { PageMeta } from '@common/ui/general';
import { meetingStatusLabel } from '~meetings/utils/meeting';
import { useHeaderLeftActions } from '@meetings/hooks';
import { withStatusProtection } from '@meetings/ui/hoc';

function ArchivePage() {
  const headerLeftActions = useHeaderLeftActions();

  return (
    <WithArchive>
      {({ archive }) => {
        const pageTitle = (
          `${meetingStatusLabel('completed')} | ${archive.name}`
        );
        return (
          <>
            <PageMeta title={pageTitle} />
            <ArchiveContainer>
              <MainContainer>
                <Header leftActions={headerLeftActions} />
                <MainActivity />
              </MainContainer>
              <Sidebar />
            </ArchiveContainer>
          </>
        );
      }}
    </WithArchive>
  );
}

export default withStatusProtection('completed')(ArchivePage);
