import { useCallback, useRef, useState } from 'react';

import { isNullOrUndefined } from '@common/utils/type';
import { warn } from '@common/utils/debug';

/**
 * Make sure that `onDrag` and `onDragEnd` do not access any component state
 * inside them as these callbacks are attached to document when drag starts.
 * Any state accessed inside them can be stale.
 */
function useDragHandlers({ onDragStart, onDrag, onDragEnd }) {
  const startRef = useRef(null);
  const [isDragging, setDragging] = useState(false);

  const storeInitialData = useCallback(({ x, y }) => {
    startRef.current = { x, y };
  }, []);

  const handleDragStart = useCallback(({ x, y }) => {
    storeInitialData({ x, y });
    setDragging(true);

    if (onDragStart) {
      onDragStart({ startX: x, startY: y });
    }
  }, [onDragStart, storeInitialData]);

  const handleDrag = useCallback(({ x: currentX, y: currentY }) => {
    if (isNullOrUndefined(startRef.current)) {
      warn('`drag` event triggered before `drag-start`');
      return;
    }

    setDragging(true);
    const { x, y } = startRef.current;

    if (onDrag) {
      onDrag({ diffX: currentX - x, diffY: currentY - y });
    }
  }, [onDrag]);

  const handleDragEnd = useCallback((event) => {
    startRef.current = null;
    setDragging(false);
    if (onDragEnd) {
      onDragEnd(event);
    }
  }, [onDragEnd]);

  /* Mouse event handlers */

  const handleMouseMove = useCallback((event) => {
    handleDrag({ x: event.clientX, y: event.clientY });
  }, [handleDrag]);

  const handleMouseUp = useCallback((event) => {
    handleDragEnd(event);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleDragEnd, handleMouseMove]);

  const handleMouseDown = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    handleDragStart({ x: event.clientX, y: event.clientY });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleDragStart, handleMouseMove, handleMouseUp]);

  /* Touch event handlers */

  const handleTouchMove = useCallback((event) => {
    handleDrag({ x: event.touches[0].clientX, y: event.touches[0].clientY });
  }, [handleDrag]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [handleDragEnd, handleTouchMove]);

  const handleTouchStart = useCallback((event) => {
    event.preventDefault();
    handleDragStart({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [handleDragStart, handleTouchEnd, handleTouchMove]);

  return {
    isDragging,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

export default useDragHandlers;
