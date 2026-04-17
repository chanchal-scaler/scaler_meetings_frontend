import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';
import clamp from 'lodash/clamp';

import { isNullOrUndefined } from '@common/utils/type';
import { SeekbarContext } from './useSeekbarContext';
import { useActions, useGlobalState } from '~video_player/hooks';
import { useDragHandlers } from '@common/hooks/index';
import SeekbarBuffered from './SeekbarBuffered';
import SeekbarHandle from './SeekbarHandle';
import SeekbarProgress from './SeekbarProgress';
import SeekbarRail from './SeekbarRail';
import SeekbarTooltip from './SeekbarTooltip';

function Seekbar({ className }) {
  const seekbarRef = useRef(null);
  const startRef = useRef();
  const [hoveredAt, setHoveredAt] = useState(null);
  const [progress, setProgress] = useState(0);

  const { setCurrentTime, setSeekTo } = useActions();

  const { currentTime, duration } = useGlobalState();

  const pixelToTime = useCallback((px) => {
    if (!seekbarRef.current || !duration) {
      return 0;
    }

    const seekbarEl = seekbarRef.current;
    const seekbarWidth = seekbarEl.offsetWidth;
    return clamp((px / seekbarWidth) * duration, 0.01, duration);
  }, [duration]);

  const timeToPercent = useCallback((time) => {
    if (!duration) {
      return 0;
    }

    return clamp((time / duration) * 100, 0, 100);
  }, [duration]);

  // Progress is stored in ref as well because state accessed inside `onDragEnd`
  // callback can be stale.
  // (See `frontend/src/common/hooks/useDragHandlers.js` for reason)
  const updateProgress = useCallback((newProgress) => {
    startRef.current.progress = newProgress;
    setProgress(newProgress);
  }, []);

  const handleMouseMove = useCallback((event) => {
    const seekbarEl = seekbarRef.current;
    if (!seekbarEl || !duration) {
      return;
    }

    const { x } = seekbarEl.getBoundingClientRect();
    setHoveredAt(event.clientX - x);
  }, [duration]);

  const handleMouseLeave = useCallback(() => {
    setHoveredAt(null);
  }, []);

  const onDragStart = useCallback(({ startX }) => {
    const seekbarEl = seekbarRef.current;
    const { x } = seekbarEl.getBoundingClientRect();
    const diffX = startX - x;
    startRef.current = { startX: diffX };
    updateProgress(pixelToTime(diffX));
  }, [pixelToTime, updateProgress]);

  const onDrag = useCallback(({ diffX }) => {
    const { startX } = startRef.current;
    const newX = startX + diffX;
    updateProgress(pixelToTime(newX));
  }, [pixelToTime, updateProgress]);

  const onDragEnd = useCallback(() => {
    if (startRef.current) {
      setSeekTo(startRef.current.progress);
      setCurrentTime(startRef.current.progress);
      startRef.current = null;
    }
  }, [setCurrentTime, setSeekTo]);

  const { isDragging, ...handlers } = useDragHandlers({
    onDragStart,
    onDrag,
    onDragEnd,
  });

  useEffect(() => {
    if (!isDragging) {
      setProgress(currentTime);
    }
  }, [currentTime, isDragging]);

  return (
    <SeekbarContext.Provider
      value={{
        hoveredAt,
        pixelToTime,
        progress,
        timeToPercent,
        seekbarRef,
      }}
    >
      <div
        ref={seekbarRef}
        className={classNames(
          'vp-seekbar',
          { 'vp-seekbar--active': !isNullOrUndefined(hoveredAt) },
          { [className]: className },
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...handlers}
      >
        <div className="vp-seekbar__tracks">
          <SeekbarRail />
          <SeekbarBuffered />
          <SeekbarProgress />
          <SeekbarTooltip />
        </div>
        <SeekbarHandle />
      </div>
    </SeekbarContext.Provider>
  );
}

export default Seekbar;
