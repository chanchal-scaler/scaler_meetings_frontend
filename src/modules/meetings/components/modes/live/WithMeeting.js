import React, { useEffect } from 'react';
import { Observer } from 'mobx-react';

import { BroadcastSetupModal } from '~meetings/ui/meeting';
import { mobxify } from '~meetings/ui/hoc';

function WithMeeting({ children, meetingStore: store, quizStore }) {
  const { meeting } = store;
  const { slug } = store.data;

  useEffect(() => {
    store.loadMeeting(slug);

    return () => {
      store.unloadMeeting();
      quizStore.reset();
    };
  }, [quizStore, slug, store]);

  if (meeting) {
    return (
      <>
        <Observer>
          {() => children({ meeting })}
        </Observer>
        <BroadcastSetupModal />
      </>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore', 'quizStore')(WithMeeting);
