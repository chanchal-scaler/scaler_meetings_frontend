import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Modal from './Modal';
import uiManager from '@common/ui/uiManager';

const DEFAULT_ALERT_NAMESPACE = 'default';

export const alert = {
  show({ name = DEFAULT_ALERT_NAMESPACE, ...data }) {
    const prefix = `alert.${name}`;
    uiManager.emit(`${prefix}.open`, data);
  },
  close(name = DEFAULT_ALERT_NAMESPACE) {
    const prefix = `alert.${name}`;
    uiManager.emit(`${prefix}.close`);
  },
};

const initialState = {
  title: '',
  content: '',
  onClose: () => { },
};

function Alert({ className, name = DEFAULT_ALERT_NAMESPACE, ...remainingProps }) {
  const [alertState, setAlertState] = useState(initialState);
  const [isOpen, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    if (alertState.onClose) {
      alertState.onClose();
    }
    setOpen(false);
  }, [alertState]);

  useEffect(() => {
    function handleAlertOpen(data) {
      setAlertState(data);
      setOpen(true);
    }

    function handleAlertClose() {
      setOpen(false);
    }

    const prefix = `alert.${name}`;
    uiManager.on(`${prefix}.open`, handleAlertOpen);
    uiManager.on(`${prefix}.close`, handleAlertClose);

    return () => {
      uiManager.off(`${prefix}.open`, handleAlertOpen);
      uiManager.off(`${prefix}.close`, handleAlertClose);
    };
  }, [name]);

  return (
    <Modal
      className={classNames(
        'alert',
        { [className]: className },
      )}
      isOpen={isOpen}
      title={alertState.title}
      onClose={handleClose}
      {...remainingProps}
    >
      <div className="alert__body">
        {alertState.content}
      </div>
    </Modal>
  );
}

Alert.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Alert;
