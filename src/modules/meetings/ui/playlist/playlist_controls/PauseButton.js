import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react';

import { dialog } from '@common/ui/general/Dialog';
import { Icon, Tappable } from '@common/ui/general';
import { SINGLETONS_NAME } from '~meetings/utils/constants';

function PauseButton({ content }) {
  const { videoSession: session } = content;
  const [isPaused, setIsPaused] = useState(session.isPaused);

  const handleClick = useCallback(() => {
    if (isPaused) {
      session.resume();
      setIsPaused(!isPaused);
    } else {
      dialog.areYouSure({
        name: SINGLETONS_NAME,
        content: 'Pausing the video will break the flow of the session.'
        + 'Learners might get to know that this is a recorded session.',
        okLabel: 'Yes, Pause Video',
        okClass: 'm-topic-card__ok-btn',
        onOk: () => {
          session.pause();
          setIsPaused(!isPaused);
        },
      });
    }
  }, [isPaused, session]);

  if (session.isOwner) {
    return (
      <Tappable
        className="btn btn-icon p-10
        m-asl-current-btn btn-inverted btn-large m-r-5"
        onClick={handleClick}
      >
        <Icon name={isPaused ? 'play' : 'pause'} />
      </Tappable>
    );
  } else {
    return null;
  }
}

export default observer(PauseButton);
