import React, { useCallback, useRef } from 'react';
import classNames from 'classnames';

import { useDragHandlers } from '@common/hooks';
import Icon from '@common/ui/general/Icon';

function ResizableSection({
  className,
  children,
  // eslint-disable-next-line no-unused-vars
  initialSize,
  // eslint-disable-next-line no-unused-vars
  minSize,
  // eslint-disable-next-line no-unused-vars
  maxSize,
  dividerWidth,
  vertical = false,
  isDisabled,
  dividerClassName,
  changeSize,
  onDragStart,
  onDragEnd,
  dividerComponent,
  size,
}) {
  const ref = useRef(null);
  const startRef = useRef(null);

  const handleDragStart = useCallback(() => {
    startRef.current = {
      initialWidth: size,
      initialHeight: size,
    };
    if (onDragStart) {
      onDragStart(size);
    }
  }, [onDragStart, size]);

  const handleSizeChange = useCallback(({ newWidth, newHeight }) => {
    const newSize = vertical ? newHeight : newWidth;
    changeSize(newSize);
  }, [vertical, changeSize]);

  const onDrag = useCallback(({ diffX, diffY }) => {
    const { initialWidth, initialHeight } = startRef.current;
    const newWidth = initialWidth + diffX;
    const newHeight = initialHeight + diffY;
    handleSizeChange({ newWidth, newHeight });
  }, [handleSizeChange]);

  const handleDragEnd = useCallback(() => {
    startRef.current = null;
    if (onDragEnd) {
      onDragEnd();
    }
  }, [onDragEnd]);

  const {
    isDragging, ...handlers
  } = useDragHandlers({
    onDragStart: handleDragStart, onDrag, onDragEnd: handleDragEnd,
  });

  function dividerUi() {
    if (isDisabled) {
      return null;
    } else {
      return (
        <div
          className={classNames(
            'hv-resizable__divider',
            { 'hv-resizable__divider--vertical': vertical },
            { 'hv-resizable__divider--horizontal': !vertical },
            { 'hv-resizable__divider--is-absolute': dividerWidth === 0 },
            { [dividerClassName]: dividerClassName },
          )}
          style={{
            [vertical ? 'height' : 'width']: dividerWidth !== 0 && dividerWidth,
          }}
          {...handlers}
        >
          {dividerComponent || (
            <>
              <Icon name="dot" />
              <Icon name="dot" />
              <Icon name="dot" />
            </>
          )}
        </div>
      );
    }
  }

  return (
    <>
      <div
        ref={ref}
        className={classNames(
          'hv-resizable__section',
          { 'hv-resiable__section--vertical': vertical },
          { [className]: className },
        )}
        style={{
          width: !vertical && (size || 0),
          height: vertical && (size || 0),
        }}
      >
        {children}
        {dividerWidth === 0 && dividerUi()}
      </div>
      {dividerWidth !== 0 && dividerUi()}
    </>
  );
}

export default ResizableSection;
