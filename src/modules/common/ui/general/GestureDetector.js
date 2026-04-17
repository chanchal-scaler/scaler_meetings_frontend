import React, { useRef, useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { forwardRef } from '@common/ui/hoc';

const DOUBLE_CLICK_TIMEOUT = 250; // In ms

function GestureDetector({
  className,
  component,
  forwardedRef,
  onClick,
  onDoubleClick,
  onSingleClick,
  ...remainingProps
}) {
  const countRef = useRef(0);
  const timerRef = useRef(null);

  const handleClick = useCallback((event) => {
    clearTimeout(timerRef.current);
    countRef.current += 1;
    const isDoubleClick = countRef.current === 2;
    if (isDoubleClick) {
      timerRef.current = null;
      countRef.current = 0;
      if (onDoubleClick) {
        onDoubleClick(event);
      }
    } else {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        countRef.current = 0;
        if (onSingleClick) {
          onSingleClick(event);
        }
      }, DOUBLE_CLICK_TIMEOUT);
    }

    if (onClick) {
      onClick(event);
    }
  }, [onClick, onDoubleClick, onSingleClick]);

  return React.createElement(
    component || 'div',
    {
      className: classNames(
        'gesture-detector',
        { [className]: className },
      ),
      ref: forwardedRef,
      ...remainingProps,
      onClick: handleClick,
    },
  );
}

GestureDetector.propTypes = {
  className: PropTypes.string,
  onDoubleClick: PropTypes.func,
  onSingleClick: PropTypes.func,
};

export default forwardRef(GestureDetector);
