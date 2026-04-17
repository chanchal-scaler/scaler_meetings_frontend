import React, { useCallback } from 'react';
import classNames from 'classnames';

import { dialog } from '@common/ui/general/Dialog';
import { Icon, Tappable } from '@common/ui/general';
import { mobxify } from '~meetings/ui/hoc';
import { ScreenShareQuality } from '~meetings/utils/media';
import { SINGLETONS_NAME } from '~meetings/utils/constants';

function PoorUploadTips({ className, mediaStore, meetingStore: store }) {
  const { meeting } = store;
  const { videoBroadcasting } = meeting;

  const handleReset = useCallback(() => {
    dialog.areYouSure({
      name: SINGLETONS_NAME,
      content: 'Proceeding will restart screen share with updated settings',
      onOk: async () => {
        mediaStore.setRecommendedScreenQuality(ScreenShareQuality.medium);
        mediaStore.setScreenQuality(ScreenShareQuality.medium);
        await videoBroadcasting.unshareScreen();
        videoBroadcasting.shareScreen();
        meeting.track('poorUploadSettingsReverted');
      },
    });
  }, [mediaStore, meeting, videoBroadcasting]);

  return (
    <div
      className={classNames(
        { [className]: className },
        'box box--flat box--large default-font mm-poor-upload-tips',
      )}
    >
      <div className="box__header">
        <Icon
          className="success h3 m-r-10"
          name="tick"
        />
        <span className="h3 dark bolder no-mgn-b">
          Network changes have been applied
        </span>
      </div>
      <div className="box__body">
        <div className="m-b-10">
          <p>
            Your screen resolution has been decreased. For better screen
            visibility, ensure the following:
          </p>
          <ol className="m-list">
            <li>
              Zoom in your screen a little so that content is readable by the
              viewers.
            </li>
          </ol>
        </div>
        <div className="row align-c">
          <span className="bold dark m-r-20">
            Switched to a better network now?
          </span>
          <Tappable
            className="btn btn-danger bold flex-fill"
            onClick={handleReset}
          >
            {mediaStore.recommendedScreenQuality === ScreenShareQuality.low
              ? 'Revert Changes'
              : 'Use default settings'}
          </Tappable>
        </div>
      </div>
    </div>
  );
}

export default mobxify('mediaStore', 'meetingStore')(PoorUploadTips);
