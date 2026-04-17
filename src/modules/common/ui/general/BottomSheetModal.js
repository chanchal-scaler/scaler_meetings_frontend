import React, { useState, useRef } from 'react';
import { useTransition, animated } from 'react-spring';
import classNames from 'classnames';

import Icon from './Icon';
import Tappable from './Tappable';

export default function BottomSheetModal({
  children,
  className,
  delay = 0,
  onAnimationEnd = () => {},
  config = {},
  reset = false,
  reverse = false,
  loop = false,
  // future: if a user wants to turn off animation but still functional
  shouldAnimate = true,
  isOpen = true,
  renderHeader = false,
  headerClassName,
  onClose = () => {},
}) {
  const [headerVisible, setHeaderVisible] = useState(false);
  const timeoutRef = useRef();
  const transitions = useTransition(isOpen, {
    enter: {
      opacity: 1,
      marginTop: '0vh',
    },
    leave: {
      opacity: 0,
      marginTop: '100vh',
    },
    from: {
      opacity: 0,
      marginTop: '100vh',
    },
    delay,
    onRest: onAnimationEnd,
    config,
    reverse,
    reset,
    loop,
    immediate: !shouldAnimate,
  });
  const handleMouseMove = (event) => {
    event.stopPropagation();
    setHeaderVisible(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHeaderVisible(false);
    }, 2000);
  };

  return transitions(
    (styles, item) => item && (
      <animated.div
        className={classNames(
          'bottom-sheet-modal',
          { [className]: className },
        )}
        style={styles}
        onMouseMove={handleMouseMove}
      >
        {renderHeader && (
          <Tappable
            onClick={onClose}
            className={classNames(
              'bottom-sheet-modal__header',
              { [headerClassName]: headerClassName },
              { 'bottom-sheet-modal__header--collapsed': !headerVisible },
            )}
          >
            <Icon name="arrow-left" />
            Go Back
          </Tappable>
        )}
        {children}
      </animated.div>
    ),
  );
}
