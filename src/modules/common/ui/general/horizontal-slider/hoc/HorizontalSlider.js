import React, { useCallback, useRef, useState } from 'react';

import useResizeObserver from '../hooks/useResizeObserver';

const HorizontalSlider = (WrappedComponent) => function CustomComponent(props) {
  const [activeColumn, setActiveColumn] = useState(1);
  const ref = useRef();
  const {
    totalWidth, visibleWidth, childWidth, margin,
  } = useResizeObserver(ref);

  const totalChildWidth = childWidth + margin;

  const step = Math.floor(visibleWidth / totalChildWidth) * totalChildWidth;
  const totalColumns = Math.ceil(totalWidth / visibleWidth);

  const handleArrowClick = useCallback((direction) => {
    if (direction === 'left' && activeColumn > 1) {
      setActiveColumn(activeColumn - 1);
    } else if (direction === 'right' && activeColumn < totalColumns) {
      setActiveColumn(activeColumn + 1);
    }
  }, [activeColumn, totalColumns]);

  if (!WrappedComponent) {
    return WrappedComponent;
  }

  return (
    <>
      <WrappedComponent
        ref={ref}
        step={step || 0}
        totalColumns={totalColumns || 0}
        activeColumn={activeColumn}
        onArrowClick={handleArrowClick}
        {...props}
      />
    </>
  );
};

export default HorizontalSlider;
