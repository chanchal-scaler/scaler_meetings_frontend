import React, {
  createElement, useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { forwardRef } from '@common/ui/hoc';
import { isBoolean, isFunction } from '@common/utils/type';
import { useOutsideClick } from '@common/hooks';
import * as CustomPropTypes from '@common/utils/propTypes';
import DropdownContext from './context';
import Popover from '../Popover';
import Tappable from '../Tappable';

/**
 * A standard `Dropdown` component. Pass `value` and `onChange` props if it
 * should be used as a controlled component. Else it behaves like uncontrolled
 * component. If clicking inside its items should close the dropdown then use
 * `DropdownItem` component
 */
function Dropdown({
  children,
  className,
  component = Tappable,
  forwardedRef,
  isOpen = false,
  onChange,
  onClick,
  popoverProps = {
    location: { right: 0, top: '100%' },
  },
  title,
  titleClassName,
  ...remainingProps
}) {
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);

  const [internalIsOpen, setInternalOpen] = useState(Boolean(isOpen));

  useEffect(() => {
    if (isBoolean(isOpen)) {
      setInternalOpen(isOpen);
    }
  }, [isOpen]);

  const handleChange = useCallback((isOpenUpdated) => {
    if (isFunction(onChange)) {
      onChange(isOpenUpdated);
    } else {
      setInternalOpen(isOpenUpdated);
    }
  }, [onChange]);

  const handleToggle = useCallback(() => {
    handleChange(!internalIsOpen);
  }, [handleChange, internalIsOpen]);

  const handleClose = useCallback(() => {
    handleChange(false);
  }, [handleChange]);

  const handleTitleClick = useCallback((event) => {
    handleToggle();
    if (isFunction(onClick)) {
      onClick(event);
    }
  }, [handleToggle, onClick]);

  /**
   * Close popover when clicked outside of it.
   */
  const handleOutsideClick = useCallback((event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      handleClose();
    }
  }, [handleClose]);

  useOutsideClick(anchorRef, handleOutsideClick);

  function titleUi() {
    return createElement(
      component,
      {
        ref: anchorRef,
        className: classNames(
          'dropdown__title',
          { [titleClassName]: titleClassName },
          { 'dropdown__title--active': internalIsOpen },
        ),
        onClick: handleTitleClick,
        ...remainingProps,
      },
      isFunction(title)
        ? title({ isOpen: internalIsOpen })
        : title,
    );
  }

  function popoverUi() {
    const {
      className: popoverClassName,
      ...remainingPopoverProps
    } = popoverProps;

    if (!children) return null;

    return (
      <Popover
        ref={popoverRef}
        anchorRef={anchorRef}
        className={classNames(
          'dropdown__popover',
          { [popoverClassName]: popoverClassName },
        )}
        isOpen={internalIsOpen}
        onClose={handleClose}
        {...remainingPopoverProps}
      >
        {children}
      </Popover>
    );
  }

  return (
    <DropdownContext.Provider
      value={{
        handleClose,
      }}
    >
      <div
        ref={forwardedRef}
        className={classNames(
          'dropdown',
          { [className]: className },
        )}
      >
        {titleUi()}
        {popoverUi()}
      </div>
    </DropdownContext.Provider>
  );
}

Dropdown.propTypes = {
  className: PropTypes.string,
  component: CustomPropTypes.componentPropType.isRequired,
  isOpen: PropTypes.bool,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  popoverProps: PropTypes.object.isRequired,
  title: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]),
  titleClassName: PropTypes.string,
};

export default forwardRef(Dropdown);
