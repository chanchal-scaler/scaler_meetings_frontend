import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import clamp from 'lodash/clamp';

import { useDragHandlers } from '@common/hooks';

const POSITION_OFFSET = 20;

function clampLeft(left) {
  return clamp(
    left,
    0,
    window.innerWidth - POSITION_OFFSET,
  );
}

function clampTop(top) {
  return clamp(
    top,
    0,
    window.innerHeight - POSITION_OFFSET,
  );
}

// TODO Add resize feature as well
function DraggableWindow({
  children,
  className,
  initialLeft = 10,
  initialTop = 10,
  onChange,
  styles,
  ...remainingProps
}) {
  const startRef = useRef(null);
  const movedRef = useRef(false);
  const [left, setLeft] = useState(clampLeft(initialLeft));
  const [top, setTop] = useState(clampTop(initialTop));

  useEffect(() => {
    if (onChange) {
      onChange({ left, top });
    }
  }, [left, top, onChange]);

  const onDragStart = useCallback(() => {
    startRef.current = { top, left };
  }, [left, top]);

  const onDrag = useCallback(({ diffX, diffY }) => {
    movedRef.current = (diffX !== 0 || diffY !== 0);

    const { left: startLeft, top: startTop } = startRef.current;
    const newLeft = clamp(
      startLeft + diffX,
      0,
      window.innerWidth - POSITION_OFFSET,
    );
    const newTop = clamp(
      startTop + diffY,
      0,
      window.innerHeight - POSITION_OFFSET,
    );
    setLeft(newLeft);
    setTop(newTop);
  }, []);

  const onDragEnd = useCallback(() => {
    startRef.current = null;
  }, []);

  const {
    isDragging,
    ...handlers
  } = useDragHandlers({ onDragStart, onDrag, onDragEnd });

  return (
    <div
      data-testid="draggable-window"
      className={classNames(
        'draggable-window',
        { 'draggable-window--dragging': isDragging },
        { [className]: className },
      )}
      style={{
        left,
        top,
        ...styles,
      }}
      {...remainingProps}
    >
      {children({
        dragClassName: 'draggable-window__trigger',
        ...handlers,
        ref: movedRef,
      })}
    </div>
  );
}

DraggableWindow.propTypes = {
  initialLeft: PropTypes.number.isRequired,
  initialTop: PropTypes.number.isRequired,
};

export default DraggableWindow;
