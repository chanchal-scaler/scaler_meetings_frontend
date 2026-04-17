import React, { useCallback } from 'react';

import { dialog } from '@common/ui/general/Dialog';
import { Tappable } from '@common/ui/general';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import stopIcon from '~meetings/images/stop-icon.svg';

function StopButton({ content }) {
  const { videoSession: session } = content;

  const handleStop = useCallback(() => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'This will stop playing the video for the audience as well.'
      + ' Learners might get to know that this is a recorded session.',
      okLabel: 'Yes, Stop Video',
      okClass: 'm-topic-card__ok-btn',
      onOk: () => content.stop(),
    });
  }, [content]);

  if (session.isOwner) {
    return (
      <Tappable
        className="btn btn-icon btn-danger btn-inverted btn-small"
        onClick={handleStop}
      >
        <img
          src={stopIcon}
          alt="stop icon"
        />
      </Tappable>
    );
  } else {
    return null;
  }
}

export default StopButton;
