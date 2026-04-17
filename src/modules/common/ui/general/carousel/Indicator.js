import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Tappable from '@common/ui/general/Tappable';

const UNIT_TIME = 1000;

function Indicator({
  carousel, className, frameCount, scrollToFrame, setCarousel, timeInterval,
  handleDotClick, disableTransition,
}) {
  const elapsedTimePercentange = (carousel.time / timeInterval) * 100;

  const skipToFrame = (frame) => {
    scrollToFrame(frame);
    setCarousel({ time: 0, frame });
    handleDotClick?.();
  };

  return (
    <div className={classNames([
      'rolling-carousel-indicator', {
        [className]: className,
      }])}
    >
      {Array(frameCount).fill(null).map((_, idx) => {
        const isActive = idx === carousel.frame;

        return (
          <Tappable
            className={classNames(['rolling-carousel-indicator__dot', {
              'rolling-carousel-indicator__dot--active': isActive,
            }])}
            key={idx}
            disabled={isActive}
            onClick={() => skipToFrame(idx)}
          >
            <div
              className="rolling-carousel-indicator__progress"
              style={disableTransition ? {} : {
                width: `${isActive * elapsedTimePercentange}%`,
                transitionDuration: `${UNIT_TIME}ms`,
              }}
            />
          </Tappable>
        );
      })}
    </div>
  );
}

Indicator.protoTypes = {
  carousel: PropTypes.object.isRequired,
  frameCount: PropTypes.number.isRequired,
  scrollToFrame: PropTypes.func.isRequired,
  setCarousel: PropTypes.func.isRequired,
  timeInterval: PropTypes.number.isRequired,
};

export default Indicator;
