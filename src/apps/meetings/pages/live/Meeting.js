import React from 'react';

import {
  Footer, Header,
  LiveContainer, MainActivity,
  MainContainer, Sidebar,
} from '~meetings/components/modes/live';
import { useHeaderLeftActions } from '@meetings/hooks';
import Playlist from '~meetings/ui/playlist/Playlist';

function Meeting() {
  const headerLeftActions = useHeaderLeftActions();

  return (
    <LiveContainer
      className="layout__content layout__content--transparent"
      renderSingletons
    >
      {() => (
        <>
          <MainContainer>
            <Header leftActions={headerLeftActions} />
            <MainActivity />
            <Playlist />
            <Footer />
          </MainContainer>
          <Sidebar />
        </>
      )}
    </LiveContainer>
  );
}

export default Meeting;
