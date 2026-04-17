import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Modal from './Modal';
import uiManager from '@common/ui/uiManager';

const DEFAULT_IMAGEMODAL_NAMESPACE = 'default';

export const imageModal = {
  show({ name = DEFAULT_IMAGEMODAL_NAMESPACE, ...data }) {
    const prefix = `imagemodal.${name}`;
    uiManager.emit(`${prefix}.open`, data);
  },
  close(name = DEFAULT_IMAGEMODAL_NAMESPACE) {
    const prefix = `imagemodal.${name}`;
    uiManager.emit(`${prefix}.close`);
  },
};

const initialState = {
  title: '',
  content: '',
  onClose: () => { },
};

function ImageModal({ className, name = DEFAULT_IMAGEMODAL_NAMESPACE, ...remainingProps }) {
  const [imageModalState, setDialogState] = useState(initialState);
  const [isOpen, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    /* istanbul ignore else */
    if (imageModalState.onClose) {
      imageModalState.onClose();
    }
    setOpen(false);
  }, [imageModalState]);

  useEffect(() => {
    function handleDialogOpen(data) {
      setDialogState(data);
      setOpen(true);
    }

    function handleDialogClose() {
      setOpen(false);
    }

    const prefix = `imagemodal.${name}`;
    uiManager.on(`${prefix}.open`, handleDialogOpen);
    uiManager.on(`${prefix}.close`, handleDialogClose);

    return () => {
      uiManager.off(`${prefix}.open`, handleDialogOpen);
      uiManager.off(`${prefix}.close`, handleDialogClose);
    };
  }, [name]);

  return (
    <Modal
      className={classNames(
        'image-modal',
        { [className]: className },
      )}
      isOpen={isOpen}
      title={imageModalState.title}
      onClose={handleClose}
      {...remainingProps}
    >
      <div className="image-modal__body">
        {imageModalState.content}
      </div>
    </Modal>
  );
}

ImageModal.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ImageModal;
