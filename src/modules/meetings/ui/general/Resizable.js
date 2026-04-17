import React, {
  Children, Fragment, useCallback, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';
import clamp from 'lodash/clamp';

const HANDLE_HEIGHT = 20;
const DEFAULT_MIN_SECTION_HEIGHT = 50;

function Resizable({
  children: _children,
  className,
  minSectionHeight = DEFAULT_MIN_SECTION_HEIGHT,
  ...remainingProps
}) {
  const startRef = useRef();
  const ref = useRef();
  const [heights, setHeights] = useState([]);
  const [isResizing, setResizing] = useState(false);
  const children = Children.toArray(_children).filter(o => Boolean(o));

  useEffect(() => {
    let newHeights = [];
    if (children.length > 0 && ref.current) {
      const totalHeight = ref.current.offsetHeight;
      const height = (
        totalHeight - (HANDLE_HEIGHT * (children.length - 1))
      ) / children.length;
      newHeights = new Array(children.length)
        .fill(Math.max(height, minSectionHeight));
    }
    setHeights(newHeights);
  }, [children.length, minSectionHeight]);

  const handleMove = useCallback((clientY) => {
    if (!startRef.current) {
      return;
    }

    const { handleIndex, startY } = startRef.current;
    const total = heights[handleIndex] + heights[handleIndex + 1];
    const min = minSectionHeight - heights[handleIndex];
    const max = (total - minSectionHeight) - heights[handleIndex];
    const diff = clamp(clientY - startY, min, max);
    const newHeights = [...heights];
    newHeights[handleIndex] = heights[handleIndex] + diff;
    newHeights[handleIndex + 1] = heights[handleIndex + 1] - diff;
    setHeights(newHeights);
  }, [heights, minSectionHeight]);

  const handleMouseMove = useCallback((event) => {
    handleMove(event.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((event) => {
    handleMove(event.touches[0].clientY);
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    startRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleEnd);
    setResizing(false);
  }, [handleMouseMove, handleTouchMove]);

  const handleStart = useCallback((clientY, handleIndex) => {
    startRef.current = { startY: clientY, handleIndex };
    setResizing(true);
  }, []);

  const handleMouseDown = useCallback((event, handleIndex) => {
    handleStart(event.clientY, handleIndex);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
  }, [handleEnd, handleMouseMove, handleStart]);

  const handleTouchStart = useCallback((event, handleIndex) => {
    handleStart(event.touches[0].clientY, handleIndex);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);
  }, [handleEnd, handleStart, handleTouchMove]);

  function handleUi(index) {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        key={`handle-${index}`}
        className="m-resizable__handle"
        onMouseDown={event => handleMouseDown(event, index)}
        onMouseUp={handleEnd}
        onTouchStart={event => handleTouchStart(event, index)}
        onTouchEnd={handleEnd}
        style={{ height: `${HANDLE_HEIGHT}px` }}
      />
    );
  }

  function childUi(child, index) {
    const isLast = index === children.length - 1;
    return (
      <Fragment key={index}>
        <div
          key={`section-${index}`}
          className="m-resizable__section"
          style={{ height: `${heights[index]}px` }}
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
        'm-resizable',
        { 'm-resizable--resizing': isResizing },
        { [className]: className },
      )}
      {...remainingProps}
    >
      {children.map(childUi)}
    </div>
  );
}

export default Resizable;
