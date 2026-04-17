import React, { useCallback } from 'react';
import { observer } from 'mobx-react';

import { dialog } from '@common/ui/general/Dialog';
import { Icon, Tappable } from '@common/ui/general';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { toast } from '@common/ui/general/Toast';

function ReplayComposedVideoButton({ content }) {
  const handleContentSelect = useCallback(async () => {
    content.play();
  }, [content]);

  const handleReplyClick = () => {
    if (content.playlist.isComposedVideoContentActive) {
      toast.show({
        message: 'Another video is already playing. '
          + 'Please wait for it to end before replying this video.',
        type: 'warning',
      });
    } else {
      dialog.areYouSure({
        name: SINGLETONS_NAME,
        content: 'This will replay the video that has already been played '
        + 'for the audience. Learners might get to know that this is a '
        + 'recorded session.',
        okLabel: 'Yes, Replay the Video',
        okClass: 'm-topic-card__ok-btn',
        onOk: handleContentSelect,
      });
    }
  };

  return (
    <Tappable
      className="tappable m-t-10 row m-up-next-card__replay"
      onClick={handleReplyClick}
    >
      <Icon name="refresh m-r-5" />
      <span className="m-up-next-card__replay-text">
        Replay Video
      </span>
    </Tappable>
  );
}

export default observer(ReplayComposedVideoButton);
