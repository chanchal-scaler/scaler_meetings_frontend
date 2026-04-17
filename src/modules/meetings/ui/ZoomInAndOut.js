import React from 'react';

import {
  TransformWrapper,
  TransformComponent,
} from 'react-zoom-pan-pinch';

function ZoomInAndOut({ children, settings = { centerZoomedOut: true, disablePadding: true } }) {
  return (
    <TransformWrapper
      {...settings}
    >
      <TransformComponent
        wrapperClass="full-width full-height"
        contentClass="full-width full-height"
      >
        {children}
      </TransformComponent>
    </TransformWrapper>
  );
}

export default ZoomInAndOut;
