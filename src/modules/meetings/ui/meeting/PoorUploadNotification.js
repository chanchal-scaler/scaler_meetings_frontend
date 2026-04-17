import React, { useCallback, useEffect } from 'react';

import { mobxify } from '~meetings/ui/hoc';
import { Icon, Modal, Tappable } from '@common/ui/general';
import { ScreenShareQuality } from '~meetings/utils/media';

function PoorUploadNotification({ meetingStore, mediaStore }) {
  const { meeting } = meetingStore;
  const { videoBroadcasting } = meeting;
  const canOptimiseScreen = videoBroadcasting
    .possibleUploadOptimisations
    .includes('screen');
  const canOptimiseVideo = videoBroadcasting
    .possibleUploadOptimisations
    .includes('video');

  useEffect(
    () => () => videoBroadcasting.setPoorUploadModalOpen(false),
    [videoBroadcasting],
  );

  const handleCancel = useCallback(() => {
    videoBroadcasting.setPoorUploadModalOpen(false);
    meeting.track('poorUploadIgnored');
  }, [meeting, videoBroadcasting]);

  const handleProceed = useCallback(async () => {
    videoBroadcasting.setPoorUploadModalOpen(false);

    if (canOptimiseVideo) {
      videoBroadcasting.setMute('video', true, 'poorNetwork');
    }

    if (canOptimiseScreen) {
      mediaStore.setScreenQuality(ScreenShareQuality.low);
      await videoBroadcasting.unshareScreen();
      videoBroadcasting.shareScreen();
    }

    meeting.track('poorUploadAcknowledged');
  }, [
    canOptimiseScreen,
    canOptimiseVideo,
    mediaStore,
    meeting,
    videoBroadcasting,
  ]);

  return (
    <Modal
      canClose={false}
      isOpen={videoBroadcasting.isPoorUploadModalOpen}
      onClose={handleCancel}
      title={(
        <div className="row align-c">
          <Icon
            className="m-r-10 danger"
            name="report"
          />
          <span>
            Poor network detected!
          </span>
        </div>
      )}
    >
      <div className="m-b-10">
        <p>
          We've detected that your network upload speed is poor and
          recommend the following changes:
        </p>
        <ol className="m-list">
          {canOptimiseVideo && <li>Disable your video</li>}
          {canOptimiseScreen
            && <li>Reduce the screen share resolution</li>}
        </ol>
        <p>
          Proceeding will apply the above settings
          {canOptimiseScreen && (
            <>
              {' '}
              and
              {' '}
              <span className="bold dark">restart screen share</span>
            </>
          )}
        </p>
      </div>
      <div className="row align-c">
        <Tappable
          className="btn btn-danger bold m-r-10"
          onClick={handleProceed}
        >
          &nbsp;
          Apply recommended changes
          &nbsp;
        </Tappable>
        <Tappable
          className="btn btn-inverted btn-primary bold"
          onClick={handleCancel}
        >
          Later
        </Tappable>
      </div>
    </Modal>
  );
}

export default mobxify('mediaStore', 'meetingStore')(PoorUploadNotification);
