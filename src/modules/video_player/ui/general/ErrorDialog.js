import React, { useCallback } from 'react';

import { useActions, useGlobalState } from '~video_player/hooks';
import { Modal, Tappable } from '@common/ui/general';

function ErrorDialog() {
  const { error } = useGlobalState();
  const { setError } = useActions();
  const isOpen = Boolean(error);

  const handleClose = useCallback(() => {
    setError(null);
  }, [setError]);

  return (
    <Modal
      className="vp-error"
      onClose={handleClose}
      isOpen={isOpen}
      title="Failed to play video"
    >
      <p>
        {
          error
            ? `${error.message} (code: ${error.code})`
            : null
        }
      </p>
      <div className="vp-error__actions">
        <Tappable
          className="btn btn-inverted m-r-10"
          onClick={handleClose}
        >
          Close
        </Tappable>
        <Tappable
          className="btn btn-inverted"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Tappable>
      </div>
    </Modal>
  );
}

export default ErrorDialog;
