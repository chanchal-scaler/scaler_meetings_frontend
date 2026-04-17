import React, { useCallback } from 'react';

import { Modal, Tappable, Icon } from '@common/ui/general';
import mobxify from '~meetings/ui/hoc/mobxify';
import StepsToAllowMedia from './steps_to_allow_media';

function PermissionRequestModal({ mediaStore }) {
  const handleClose = useCallback(() => {
    mediaStore.setShowPermissionsGuide(null);
  }, [mediaStore]);

  return (
    <Modal
      className="m-modal m-modal--large p-20"
      isOpen={mediaStore.showPermissionsGuide}
      onClose={handleClose}
      withoutHeader
      hasCloseButton={false}
    >
      <div className="column">
        <div className="bold h4 text-c">
          <Icon name="info" className="danger m-r-5" />
          Camera and/or Microphone blocked
        </div>
        <div className="info h5 m-v-10 text-c">
          Your browser has blocked
          {' '}
          <span className="bold">Scaler</span>
          {' '}
          from accessing your camera and/or microphone.
        </div>
        <div className="bold h4 m-v-10">Follow these simple steps:</div>
        <StepsToAllowMedia />
        <Tappable
          className="btn btn-inverted btn-danger btn-small"
          onClick={handleClose}
        >
          Close
        </Tappable>
      </div>
    </Modal>
  );
}

export default mobxify('mediaStore')(PermissionRequestModal);
