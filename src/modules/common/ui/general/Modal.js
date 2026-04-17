import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Backdrop from './Backdrop';
import Icon from './Icon';
import Tappable from './Tappable';

function Modal({
  canClose = true,
  children,
  className,
  containerClassName,
  closeOnBackdropClick,
  closeOnEscPress,
  hasBackdrop = true,
  hasCloseButton = true,
  isAbsolute = false,
  isFlat = false,
  position,
  isOpen = false,
  onClose,
  size,
  title,
  backgroundScroll = true,
  unMountOnClose = false,
  withoutHeader = false,
  titleClassName,
  headerClassName,
  backdropClassName,
  ...remainingProps
}) {
  function closeUi({ closeClassName }) {
    if (canClose && hasCloseButton) {
      return (
        <Tappable
          className={classNames(
            { [closeClassName]: closeClassName },
          )}
          onClick={onClose}
          aria-label="close"
        >
          <Icon name="close" />
        </Tappable>
      );
    } else {
      return null;
    }
  }

  function headerUi() {
    if (withoutHeader) {
      return null;
    } else {
      return (
        <div
          className={classNames(
            'sr-modal__header',
            { [headerClassName]: headerClassName },
          )}
        >
          <div
            className={classNames(
              'sr-modal__title',
              { [titleClassName]: titleClassName },
            )}
          >
            {title}
          </div>
          <div className="sr-modal__close">
            {closeUi({ closeClassName: 'btn btn-icon btn-inverted' })}
          </div>
        </div>
      );
    }
  }

  function bodyUi() {
    return (
      <div
        className={classNames(
          'sr-modal__body',
          { [containerClassName]: containerClassName },
        )}
      >
        {children}
      </div>
    );
  }

  function modalUi() {
    return (
      <div
        className={classNames(
          'sr-modal',
          { 'sr-modal--absolute': isAbsolute },
          { 'sr-modal--flat': isFlat },
          { [`sr-modal--${position}`]: position },
          { [`sr-modal--${size}`]: size },
          { 'sr-modal--open': isOpen },
          { [className]: className },
        )}
        {...remainingProps}
      >
        {withoutHeader && closeUi({
          closeClassName: 'sr-modal__close-alt no-highlight',
        })}
        {headerUi()}
        {bodyUi()}
      </div>
    );
  }

  function backdropUi() {
    return (
      <Backdrop
        canClose={canClose}
        closeOnBackdropClick={closeOnBackdropClick}
        closeOnEscPress={closeOnEscPress}
        isAbsolute={isAbsolute}
        isOpen={hasBackdrop && isOpen}
        onClose={onClose}
        className={backdropClassName}
      />
    );
  }

  useEffect(() => {
    const bodyEle = document.getElementsByClassName('react-root')[0];
    if (isOpen && !backgroundScroll) {
      bodyEle?.classList.add('hide-overflow');
    } else {
      bodyEle?.classList.remove('hide-overflow');
    }
    return (() => {
      bodyEle?.classList.remove('hide-overflow');
    });
  }, [backgroundScroll, isOpen]);

  if (isOpen || !unMountOnClose) {
    return (
      <>
        {backdropUi()}
        {modalUi()}
      </>
    );
  } else {
    return null;
  }
}

Modal.propTypes = {
  canClose: PropTypes.bool.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  hasCloseButton: PropTypes.bool,
  hasBackdrop: PropTypes.bool,
  isAbsolute: PropTypes.bool,
  isOpen: PropTypes.bool,
  isFlat: PropTypes.bool,
  onClose: PropTypes.func,
  backgroundScroll: PropTypes.bool,
  position: PropTypes.oneOf(['right', 'center', 'bottom']),
  size: PropTypes.oneOf(['large', 'extra-large']),
  title: PropTypes.node,
  titleClassName: PropTypes.string,
  backdropClassName: PropTypes.string,
  containerClassName: PropTypes.string,
  unMountOnClose: PropTypes.bool,
  withoutHeader: PropTypes.bool,
};

export default Modal;
