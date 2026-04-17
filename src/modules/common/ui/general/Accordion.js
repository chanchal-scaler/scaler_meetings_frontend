import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { componentPropType } from '@common/utils/propTypes';
import { forwardRef } from '@common/ui/hoc';
import { isNullOrUndefined } from '@common/utils/type';

/**
 * Top Level Component for Accordion.
 *
 * @class Accordion
 * @extends {React.Component}
 */
function Accordion({
  className,
  component = 'div',
  children,
  defaultOpen = false,
  isOpen,
  forwardedRef,
  // eslint-disable-next-line no-unused-vars
  title = ({ active, onClick }) => { },
  onChange,
  onClick,
  ...rest
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  useEffect(() => {
    setInternalOpen(defaultOpen);
  }, [defaultOpen]);

  useEffect(() => {
    if (!isNullOrUndefined(isOpen) && (isOpen !== internalOpen)) {
      setInternalOpen(isOpen);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /**
   * Handles onClick event. Toggles accordion state.
   *
   * @memberof Accordion
   */
  const handleClick = useCallback(() => {
    setInternalOpen(!internalOpen);
    // eslint-disable-next-line no-unused-expressions
    onClick && onClick(!internalOpen);
    // eslint-disable-next-line no-unused-expressions
    onChange && onChange(!internalOpen);
  }, [internalOpen, onClick, onChange]);

  return React.createElement(
    component,
    {
      ref: forwardedRef,
      className: classNames(
        'accordion',
        { [className]: className },
      ),
      ...rest,
    },
    <>
      {title({ active: internalOpen, onClick: handleClick })}
      {internalOpen ? children : null}
    </>,
  );
}

Accordion.propTypes = {
  /* Component prop tells how to render the Accordion */
  component: componentPropType,

  /* Children of accordian must be a
  node which gets rendered based on internalOpen state */
  children: PropTypes.node.isRequired,

  /* open prop is used to pass the initial opened state */
  defaultOpen: PropTypes.bool,

  /**
   * Specifies if the accordion is expanded.
   * Pass this when you need to use accordion as a controlled component.
   * Specify onChange as well to sync the accordion state in parent component.
   */
  isOpen: PropTypes.bool,

  /**
   * Callback triggered when accordion state changes.
   */
  onChange: PropTypes.func,

  /**
   * Title is a renderProp
   *
   * @param {*} { active, onClick }
   * @returns Node
   */
  title: PropTypes.func,
};

export default forwardRef(Accordion);
