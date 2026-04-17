import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import HotKey from '@common/lib/hotKey';

function Backdrop({
  canClose = true,
  className,
  closeOnBackdropClick = true,
  closeOnEscPress = true,
  isAbsolute = false,
  isOpen = false,
  onClick,
  onClose,
  ...remainingProps
}) {
  useEffect(() => {
    function closeModal(event) {
      const hotKey = new HotKey(event);

      if (hotKey.didPress('esc')) {
        if (isOpen) {
          onClose();
          window.removeEventListener('keydown', closeModal);
        }
      }
    }

    if (canClose && closeOnEscPress) {
      window.addEventListener('keydown', closeModal);

      return () => window.removeEventListener('keydown', closeModal);
    }

    return undefined;
  }, [canClose, closeOnEscPress, onClose, isOpen]);

  const handleClick = useCallback((event) => {
    if (canClose && closeOnBackdropClick) {
      onClose();
    }

    if (onClick) {
      onClick(event);
    }
  }, [canClose, closeOnBackdropClick, onClick, onClose]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      data-testid="backdrop"
      className={classNames(
        'sr-backdrop',
        { 'sr-backdrop--absolute': isAbsolute },
        { 'sr-backdrop--open': isOpen },
        { [className]: className },
      )}
      onClick={handleClick}
      {...remainingProps}
    />
  );
}

Backdrop.propTypes = {
  canClose: PropTypes.bool.isRequired,
  className: PropTypes.string,
  closeOnBackdropClick: PropTypes.bool,
  closeOnEscPress: PropTypes.bool,
  isAbsolute: PropTypes.bool,
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  onClose: PropTypes.func,
};

export default Backdrop;
