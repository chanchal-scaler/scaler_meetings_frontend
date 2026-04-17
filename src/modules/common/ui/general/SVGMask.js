import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import clamp from 'lodash/clamp';

import { isInViewport, scrollToElement } from '@common/utils/dom';
import { useWindowSize } from '@common/hooks';

let masksRendered = 0;

const SCROLL_OFFSET = 240;

function SVGMask({
  borderRadius = 4,
  highlightSelector,
  isVisible = false,
  padding = 10,
}) {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const idRef = useRef(masksRendered += 1);
  const maskId = `svg-mask-${idRef.current}`;

  const [highlightEl, setHighlightEl] = useState(null);
  useEffect(() => {
    const el = document.querySelector(highlightSelector);

    if (el && !isInViewport(el)) {
      scrollToElement(el, SCROLL_OFFSET, null, 'auto');
    }
    setHighlightEl(el);
  }, [highlightSelector]);

  if (isVisible) {
    if (highlightEl) {
      const rect = highlightEl.getBoundingClientRect();
      const left = clamp(rect.left - padding, 0, windowWidth);
      const top = clamp(rect.top - padding, 0, windowHeight);
      const width = clamp(
        highlightEl.offsetWidth + 2 * padding,
        0,
        windowWidth,
      );
      const height = clamp(
        highlightEl.offsetHeight + 2 * padding,
        0,
        windowHeight,
      );

      return (
        <div className="svg-mask">
          <svg
            width={windowWidth}
            height={windowHeight}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id={maskId}>
                <rect
                  x={0}
                  y={0}
                  width={windowWidth}
                  height={windowHeight}
                  fill="#bbbbbb"
                />
                <rect
                  x={left}
                  y={top}
                  width={width}
                  height={height}
                  fill="#000000"
                  rx={borderRadius}
                  ry={borderRadius}
                />
              </mask>
            </defs>
            <rect
              x={0}
              y={0}
              width={windowWidth}
              height={windowHeight}
              fill="#000000"
              mask={`url(#${maskId})`}
            />
          </svg>
        </div>
      );
    } else {
      return <div className="svg-mask svg-mask--empty" />;
    }
  } else {
    return null;
  }
}

SVGMask.propTypes = {
  borderRadius: PropTypes.number.isRequired,
  highlightSelector: PropTypes.string,
  isVisible: PropTypes.bool.isRequired,
  padding: PropTypes.number.isRequired,
};

export default SVGMask;
