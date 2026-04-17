import React, { useEffect, useMemo, useState } from 'react';

import { encodeId } from '~meetings/utils/misc';

const LOOP_TICK = 3000;
const QUADRANT_TIME = 5; // Number of ticks before moving to next quadrant

const style = {
  position: 'fixed',
  zIndex: 2147483647, // Max possible z-index
  backgroundColor: 'rgba(1, 1, 1, 0.3)',
  color: '#ffffff',
  padding: '2px 4px',
  borderRadius: 3,
  opacity: 0.5,
  fontSize: 10,
  textTransform: 'uppercase',
};

const spacing = {
  vertical: 100,
  horizontal: 100,
};

const quadrants = [{
  top: spacing.vertical,
  left: spacing.horizontal,
}, {
  top: spacing.vertical,
  right: spacing.horizontal,
}, {
  bottom: spacing.vertical,
  left: spacing.horizontal,
}, {
  bottom: spacing.vertical,
  right: spacing.horizontal,
}];

function Watermark({ userId }) {
  const [loop, setLoop] = useState(0);
  const encodedId = useMemo(() => encodeId(userId), [userId]);

  useEffect(() => {
    const interval = setInterval(
      () => setLoop(prevLoop => prevLoop + 1),
      LOOP_TICK,
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      key={loop}
      style={{
        ...style,
        ...quadrants[parseInt(loop / QUADRANT_TIME, 10) % quadrants.length],
      }}
    >
      {encodedId}
    </div>
  );
}

export default Watermark;
