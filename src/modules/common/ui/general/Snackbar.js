import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { isObject, isString } from '@common/utils/type';
import Tappable from './Tappable';
import uiManager from '@common/ui/uiManager';

export const snackbar = {
  show(data) {
    uiManager.emit('snackbar.open', data);
  },
  hide() {
    uiManager.emit('snackbar.close');
  },
};

const defaultState = {
  message: '',
  duration: 3000,
  action: () => { },
  label: '',
  type: 'dark',
  position: 'bottom-left',
};

function Snackbar() {
  const [snackbarState, setSnackbarState] = useState(defaultState);
  const [isVisible, setVisible] = useState(false);
  const timeoutId = useRef(null);

  useEffect(() => {
    function handleSnackbarClose() {
      setVisible(false);
    }

    function handleSnackbarOpen(data) {
      const newState = { ...defaultState, ...data };
      setSnackbarState(newState);
      setVisible(true);
      window.clearTimeout(timeoutId.current);
      timeoutId.current = window.setTimeout(
        handleSnackbarClose,
        newState.duration,
      );
    }

    uiManager.on('snackbar.open', handleSnackbarOpen);
    uiManager.on('snackbar.close', handleSnackbarClose);

    return () => {
      uiManager.off('snackbar.open', handleSnackbarOpen);
      uiManager.off('snackbar.close', handleSnackbarClose);
      window.clearTimeout(timeoutId.current);
    };
  }, []);

  if (isVisible) {
    const {
      type, position, label, action, message,
    } = snackbarState;
    return (
      <div
        className={classNames(
          'snackbar',
          `snackbar--${type}`,
          { [`snackbar--${position}`]: isString(position) },
        )}
        style={isObject(position) ? position : {}}
      >
        <div className="snackbar__message">
          {message}
        </div>
        <Tappable
          className={classNames(
            'btn btn-light btn-small m-l-10',
            { 'btn-light': type !== 'light' },
            { 'btn-dark': type === 'light' },
          )}
          onClick={action}
        >
          {label}
        </Tappable>
      </div>
    );
  } else {
    return null;
  }
}

export default Snackbar;
