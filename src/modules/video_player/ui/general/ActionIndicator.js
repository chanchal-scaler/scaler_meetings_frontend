import React, { useEffect, useRef, useState } from 'react';

import { Icon } from '@common/ui/general';

const actionIconsMap = {
  play: 'play',
  pause: 'pause',
  forward: 'forward',
  rewind: 'rewind',
  mute: 'volume-off',
  unmute: 'volume-high',
  next: 'next',
};

const ANIMATION_DURATION = 360; // In ms

function ActionIndicator({
  action,
  onAnimationEnd,
}) {
  const timerRef = useRef(null);
  const [internalAction, setInternalAction] = useState(action);
  const actionIcon = actionIconsMap[internalAction];

  useEffect(() => {
    clearTimeout(timerRef.current);
    setInternalAction(action);

    if (action) {
      timerRef.current = setTimeout(() => {
        setInternalAction(null);

        if (onAnimationEnd) {
          onAnimationEnd();
        }
      }, ANIMATION_DURATION);
    }
  }, [action, onAnimationEnd]);

  if (internalAction && actionIcon) {
    return (
      <div className="vp-action-indicator">
        <Icon name={actionIcon} />
      </div>
    );
  } else {
    return null;
  }
}

export default ActionIndicator;
