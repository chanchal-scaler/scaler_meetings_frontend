import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import clamp from 'lodash/clamp';

import { isNullOrUndefined } from '@common/utils/type';
import { mobxify } from '~meetings/ui/hoc';
import { useMediaQuery } from '@common/hooks';

const MIN_WIDTH = 270;
const MAX_WIDTH = 400;

function SidebarContainer({
  isOpen,
  settingsStore,
  children,
}) {
  const startRef = useRef();
  const { mobile } = useMediaQuery();
  const [isResizing, setResizing] = useState(false);

  const handleMove = useCallback((clientX) => {
    if (isNullOrUndefined(startRef.current)) {
      return;
    }

    const { startX, width } = startRef.current;
    const diff = startX - clientX;
    const newWidth = clamp(
      width + diff,
      MIN_WIDTH,
      MAX_WIDTH,
    );
    settingsStore.setSidebarWidth(newWidth);
  }, [settingsStore]);

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

  const handleStart = useCallback((clientX) => {
    startRef.current = { startX: clientX, width: settingsStore.sidebarWidth };
    setResizing(true);
  }, [settingsStore.sidebarWidth]);

  const handleMouseDown = useCallback((event) => {
    event.preventDefault();
    handleStart(event.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
  }, [handleEnd, handleMouseMove, handleStart]);

  const handleTouchStart = useCallback((event) => {
    event.preventDefault();
    handleStart(event.touches[0].clientX);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);
  }, [handleEnd, handleStart, handleTouchMove]);

  function resizeUi() {
    return (
      // eslint-disable-next-line
      <a
        className="m-sidebar__resizer"
        onMouseDown={handleMouseDown}
        onMouseUp={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleEnd}
      />
    );
  }

  if (!mobile) {
    return (
      <div
        className={classNames(
          'm-sidebar',
          { 'm-sidebar--open': isOpen },
          { 'm-sidebar--resizing': isResizing },
        )}
        style={{ width: settingsStore.sidebarWidth }}
      >
        {resizeUi()}
        {children}
      </div>
    );
  } else {
    return null;
  }
}

export default mobxify('settingsStore')(SidebarContainer);
