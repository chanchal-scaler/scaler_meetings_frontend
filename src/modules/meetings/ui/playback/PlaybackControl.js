import React, { useCallback } from 'react';
import { Observer } from 'mobx-react';
import classNames from 'classnames';

import {
  AspectRatio, DraggableWindow, Icon, SwitchRow, Tappable, Tooltip,
} from '@common/ui/general';
import { dialog } from '@common/ui/general/Dialog';
import { mobxify } from '~meetings/ui/hoc';
import { SINGLETONS_NAME } from '~meetings/utils/constants';
import PlaybackStream from './PlaybackStream';

function PlaybackControl({ meetingStore: store }) {
  const { meeting } = store;
  const { playback, videoBroadcasting } = meeting;

  const handleRemove = useCallback(() => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceed will remove the video for everyone',
      onOk: () => playback.remove(),
    });
  }, [playback]);

  function visibilityMessageUi() {
    if (playback.isVisibleToAll) {
      return (
        <>
          <Icon className="m-r-5" name="play" />
          <span>Video is visible to audience</span>
        </>
      );
    } else if (videoBroadcasting.hasIllustrativeContent) {
      return (
        <>
          <Icon className="m-r-5" name="share-screen" />
          <span>Screen is visible to audience</span>
        </>
      );
    } else {
      return null;
    }
  }

  function visibilityToggleUi() {
    if (!playback.canToggleVisibility) {
      return null;
    } else {
      return (
        <SwitchRow
          checked={playback.onTop}
          className="m-playback-control__actions m-playback-control__switch"
          label="Always on top"
          onChange={(event) => playback.bringToTop(event.target.checked)}
          small
        />
      );
    }
  }

  if (playback && playback.isAdded) {
    return (
      <DraggableWindow
        className="m-playback-control"
        initialLeft={50}
        initialTop={100}
      >
        {({ dragClassName, ...handlers }) => (
          <Observer>
            {() => (
              <>
                <div
                  className={classNames(
                    dragClassName,
                    'm-playback-control__header',
                  )}
                  {...handlers}
                >
                  <div className="m-playback-control__title">
                    {visibilityMessageUi()}
                  </div>
                  <div className="m-playback-control__actions">
                    {visibilityToggleUi()}
                    <Tooltip
                      className="
                        btn btn-icon btn-dark btn-small
                        m-playback-control__action
                      "
                      component={Tappable}
                      disabled={playback.isLoading}
                      onClick={handleRemove}
                      title="Remove Video"
                    >
                      <Icon name="clear" />
                    </Tooltip>
                  </div>
                </div>
                <AspectRatio
                  className="m-playback-control__body"
                  ratio={16 / 9}
                >
                  <PlaybackStream />
                </AspectRatio>
              </>
            )}
          </Observer>
        )}
      </DraggableWindow>
    );
  } else {
    return null;
  }
}

export default mobxify('meetingStore')(PlaybackControl);
