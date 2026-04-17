import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Modal from './Modal';
import Tappable from './Tappable';
import uiManager from '@common/ui/uiManager';
import { sendSubmitGTMEvent } from '@common/utils/gtm';

const DEFAULT_DIALOG_NAMESPACE = 'default';

export const dialog = {
  show({ name = DEFAULT_DIALOG_NAMESPACE, ...data }) {
    const prefix = `dialog.${name}`;
    uiManager.emit(`${prefix}.open`, data);
  },
  close(name = DEFAULT_DIALOG_NAMESPACE) {
    const prefix = `dialog.${name}`;
    uiManager.emit(`${prefix}.close`);
  },
  areYouSure({ name = DEFAULT_DIALOG_NAMESPACE, ...data }) {
    const modalProps = {
      name,
      title: data.title || 'Are you sure?',
      okLabel: data.okLabel || 'Yes, Proceed',
      cancelLabel: data.cancelLabel || 'No, Cancel',
      cancelClass: data.cancelClass || '',
      okClass: data.okClass || 'btn-danger',
      content: data.content,
      onOk: data.onOk,
      gtmData: data.gtmData,
      hideCancel: data.hideCancel || false,
      withoutHeader: data.withoutHeader || false,
      size: data.size || undefined,
      hasCloseButton: data.hasCloseButton || false,
      modalClassName: data.modalClassName || '',
      modalBodyClassName: data.modalBodyClassName || '',
      modalBackdropClassName: data.modalBackdropClassName || '',
    };
    dialog.show(modalProps);
  },
};

const initialState = {
  title: '',
  okLabel: '',
  cancelLabel: '',
  okClass: '',
  cancelClass: '',
  content: '',
  onCancel: () => { },
  onOk: () => { },
  onClose: () => { },
  hideCancel: false,
  withoutHeader: false,
  size: undefined,
  hasCloseButton: false,
  modalClassName: '',
  modalBodyClassName: '',
  modalBackdropClassName: '',

};

function Dialog({ className, name = DEFAULT_DIALOG_NAMESPACE, ...remainingProps }) {
  const [dialogState, setDialogState] = useState(initialState);
  const [isOpen, setOpen] = useState(false);

  const dialogConfirmationGTMEvent = useCallback((confirmAction) => {
    if (dialogState.gtmData) {
      const { eventName, ...rest } = dialogState.gtmData;
      sendSubmitGTMEvent(eventName, {
        isConfirm: true,
        confirmAction,
        ...rest,
      });
    }
  }, [dialogState]);

  const handleClose = useCallback(() => {
    dialogConfirmationGTMEvent(false);
    /* istanbul ignore next */
    if (dialogState.onClose) {
      dialogState.onClose();
    }
    setOpen(false);
  }, [dialogState, dialogConfirmationGTMEvent]);

  const handleCancel = useCallback(() => {
    dialogConfirmationGTMEvent(false);
    /* istanbul ignore next */
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
    setOpen(false);
  }, [dialogState, dialogConfirmationGTMEvent]);

  const handleOk = useCallback(() => {
    dialogConfirmationGTMEvent(true);
    /* istanbul ignore next */
    if (dialogState.onOk) {
      dialogState.onOk();
    }
    setOpen(false);
  }, [dialogState, dialogConfirmationGTMEvent]);

  useEffect(() => {
    function handleDialogOpen(data) {
      setDialogState(data);
      setOpen(true);
    }

    function handleDialogClose() {
      setOpen(false);
    }

    const prefix = `dialog.${name}`;
    uiManager.on(`${prefix}.open`, handleDialogOpen);
    uiManager.on(`${prefix}.close`, handleDialogClose);

    return () => {
      uiManager.off(`${prefix}.open`, handleDialogOpen);
      uiManager.off(`${prefix}.close`, handleDialogClose);
    };
  }, [name]);

  function dialogUI() {
    return (
      <Modal
        className={classNames(
          'dialog',
          { [className]: className },
          { [dialogState.modalClassName]: dialogState.modalClassName },
        )}
        containerClassName={classNames(
          { [dialogState.modalBodyClassName]: dialogState.modalBodyClassName },
        )}
        backdropClassName={classNames(
          {
            [dialogState.modalBackdropClassName]:
              dialogState.modalBackdropClassName,
          },
        )}
        isOpen={isOpen}
        title={dialogState.title}
        onClose={handleClose}
        withoutHeader={dialogState.withoutHeader}
        size={dialogState.size}
        hasCloseButton={dialogState.hasCloseButton}
        {...remainingProps}
      >
        <div className="dialog__body">
          {dialogState.content}
        </div>
        <div className="dialog__actions">
          {!dialogState.hideCancel && (
            <Tappable
              className={classNames(
                'btn btn-outlined dialog__action',
                dialogState.cancelClass,
              )}
              onClick={handleCancel}
            >
              {dialogState.cancelLabel}
            </Tappable>
          )}
          <Tappable
            className={classNames(
              'btn dialog__action',
              dialogState.okClass,
            )}
            onClick={handleOk}
          >
            {dialogState.okLabel}
          </Tappable>
        </div>
      </Modal>
    );
  }

  return dialogUI();
}

Dialog.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Dialog;
