import React from 'react';
import clamp from 'lodash/clamp';

import { toCountdown } from '~video_player/utils/date';
import useSeekbarContext from './useSeekbarContext';

const TOOLTIP_OFFSET = 35;

function SeekbarTooltip() {
  const { hoveredAt, pixelToTime, seekbarRef } = useSeekbarContext();

  if (hoveredAt) {
    const timestamp = pixelToTime(hoveredAt);
    const seekbarEl = seekbarRef.current;
    // Below value is only used for positioning purpose so that tooltip does
    // not go out of view in the corners
    let normalizedHoveredAt = hoveredAt;
    if (seekbarEl) {
      normalizedHoveredAt = clamp(
        normalizedHoveredAt,
        TOOLTIP_OFFSET,
        seekbarEl.offsetWidth - TOOLTIP_OFFSET,
      );
    }
    return (
      <div className="vp-seekbar-tooltip">
        <div
          style={{ left: normalizedHoveredAt }}
          className="vp-seekbar-tooltip__message"
        >
          {toCountdown(timestamp)}
        </div>
        <div
          style={{ left: hoveredAt }}
          className="vp-seekbar-tooltip__mark"
        />
      </div>
    );
  } else {
    return null;
  }
}

export default SeekbarTooltip;
