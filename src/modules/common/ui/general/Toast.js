import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

import uiManager from '@common/ui/uiManager';

export const toast = {
  show(data) {
    uiManager.emit('toast.open', data);
  },
  hide() {
    uiManager.emit('toast.close');
  },
};

const defaultState = {
  duration: 3000,
  message: '',
  /**
   * Possible values are `top-center`, `top-left`, `top-right`,
   * `bottom-center`, `bottom-left`, `bottom-right`.
   */
  position: 'top-center',
  /**
   * Possible values are `info`, `success`, `error`, `warning`.
   */
  type: 'info',
  /**
   * Any extra class name for extra styling like changing z-index in mentee app
   */
  className: 'normal',
};

function Toast() {
  const [toastState, setToastState] = useState({ ...defaultState });
  const [isVisible, setVisible] = useState(false);
  const timeoutId = useRef(null);

  useEffect(() => {
    function handleToastClose() {
      setVisible(false);
    }

    function handleToastOpen(data) {
      const newState = { ...defaultState, ...data };
      setToastState(newState);
      setVisible(true);
      window.clearTimeout(timeoutId.current);
      timeoutId.current = window.setTimeout(
        () => {
          handleToastClose();
          if (typeof data.onClose?.call === 'function') {
            data.onClose();
          }
        },
        newState.duration,
      );
    }

    uiManager.on('toast.open', handleToastOpen);
    uiManager.on('toast.close', handleToastClose);

    return () => {
      uiManager.off('toast.open', handleToastOpen);
      uiManager.off('toast.close', handleToastClose);
      window.clearTimeout(timeoutId.current);
    };
  }, []);

  function toastUi() {
    return (
      <div
        className={classNames(
          'toast',
          `toast--${toastState.position}`,
          `toast--${toastState.type}`,
          `toast--${toastState.className}`,
        )}
      >
        <div className="toast__message bold">
          {toastState.message}
        </div>
      </div>
    );
  }

  return isVisible ? toastUi() : null;
}

export default Toast;
