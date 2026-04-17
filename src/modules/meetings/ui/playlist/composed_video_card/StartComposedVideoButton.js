import React, { useCallback } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { dialog } from '@common/ui/general/Dialog';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import { Tappable } from '@common/ui/general';
import { toast } from '@common/ui/general/Toast';
import startIcon from '~meetings/images/start-icon.svg';

const StartComposedVideoButton = ({ className, content }) => {
  const handleContentSelect = useCallback(async () => {
    content.play();
  }, [content]);

  const handleStartClick = () => {
    if (content.playlist.isComposedVideoContentActive) {
      toast.show({
        message: 'Another video is already playing. '
          + 'Please wait for it to end before starting the next video.',
        type: 'warning',
      });
    } else {
      dialog.areYouSure({
        name: SINGLETONS_NAME,
        content: 'Proceeding will play the video selected by you.'
          + ' The audience will see the video once you click on play.',
        okLabel: 'Yes, Play Video',
        okClass: 'm-topic-card__ok-btn',
        onOk: handleContentSelect,
      });
    }
  };

  return (
    <Tappable
      className={classNames(
        'row m-up-next-card__start',
        { [className]: className },
      )}
      disabled={content.isStarting}
      onClick={handleStartClick}
    >
      <img
        src={startIcon}
        alt="start icon"
      />
      <div className="h5 m-l-10 m-t-3">
        Start Video
      </div>
    </Tappable>
  );
};

export default observer(StartComposedVideoButton);
