import React, {
  Children, Fragment, useCallback, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';
import clamp from 'lodash/clamp';

const HANDLE_WIDTH = 10;
const DEFAULT_MIN_SECTION_WIDTH = 50;

function HorizontalResizeable({
  children: _children,
  className,
  minSectionWidth = DEFAULT_MIN_SECTION_WIDTH,
  minWidth,
  ...remainingProps
}) {
  const startRef = useRef(null);
  const ref = useRef(null);
  const [widths, setWidths] = useState([]);
  const [isResizing, setResizing] = useState(false);
  const children = Children.toArray(_children).filter(o => Boolean(o));

  useEffect(() => {
    let newWidths = [];
    if (children.length > 0 && ref.current) {
      const totalWidth = ref.current.offsetWidth;
      const width = (
        totalWidth - (HANDLE_WIDTH * (children.length - 1))
      ) / children.length;
      newWidths = new Array(children.length)
        .fill(Math.max(width, minSectionWidth));
    }
    setWidths(newWidths);
  }, [children.length, minSectionWidth]);

  const handleMove = useCallback((clientX) => {
    if (!startRef.current) {
      return;
    }

    const { handleIndex, startX } = startRef.current;
    const total = widths[handleIndex] + widths[handleIndex + 1];
    const min = minSectionWidth - widths[handleIndex];
    const max = (total - minSectionWidth) - widths[handleIndex];
    const diff = clamp(clientX - startX, min, max);
    const newWidths = [...widths];
    newWidths[handleIndex] = widths[handleIndex] + diff;
    newWidths[handleIndex + 1] = widths[handleIndex + 1] - diff;
    let shouldUpdate = true;
    newWidths.forEach(width => {
      if (width < minWidth) shouldUpdate = false;
    });
    if (shouldUpdate) setWidths(newWidths);
  }, [widths, minSectionWidth, minWidth]);

  const handleMouseMove = useCallback((event) => {
    handleMove(event.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((event) => {
    handleMove(event.touches[0].clientX);
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    startRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleEnd);
    setResizing(false);
  }, [handleMouseMove, handleTouchMove]);

  const handleStart = useCallback((clientX, handleIndex) => {
    startRef.current = { startX: clientX, handleIndex };
    setResizing(true);
  }, []);

  const handleMouseDown = useCallback((event, handleIndex) => {
    handleStart(event.clientX, handleIndex);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
  }, [handleEnd, handleMouseMove, handleStart]);

  const handleTouchStart = useCallback((event, handleIndex) => {
    handleStart(event.touches[0].clientX, handleIndex);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);
  }, [handleEnd, handleStart, handleTouchMove]);

  function handleUi(index) {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        key={`handle-${index}`}
        className="resizable__handle"
        onMouseDown={event => handleMouseDown(event, index)}
        onMouseUp={handleEnd}
        onTouchStart={event => handleTouchStart(event, index)}
        onTouchEnd={handleEnd}
        style={{ width: `${HANDLE_WIDTH}px` }}
      />
    );
  }

  function childUi(child, index) {
    const isLast = index === children.length - 1;
    return (
      <Fragment key={index}>
        <div
          key={`section-${index}`}
          className="resizable__section"
          style={{ width: `${widths[index]}px` }}
        >
          {child}
        </div>
        {!isLast && handleUi(index)}
      </Fragment>
    );
  }

  return (
    <div
      ref={ref}
      className={classNames(
        'resizable',
        { 'resizable--resizing': isResizing },
        { [className]: className },
      )}
      {...remainingProps}
    >
      {children.map(childUi)}
    </div>
  );
}

export default HorizontalResizeable;
