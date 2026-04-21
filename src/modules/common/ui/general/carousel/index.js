import React, {
  Children, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Indicator from './Indicator';

const UNIT_TIME = 1000; // in ms

/**
 *
 * A carousel component that displays a set of slides and
 *  automatically scrolls through them at a specified time interval.
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The slides to be
 *  displayed in the carousel.
 * @param {string} [props.className] - Additional CSS class name(s)
 *  for the carousel container.
 * @param {number} [props.timeInterval] - The time interval
 *  (in milliseconds) between slide transitions.
 * @returns {React.ReactElement} The rendered carousel component.
 */

function Carousel({
  children, className, indicatorClassName, timeInterval = 10000,
  handleDotClick, disableTransition = false,
}) {
  const ref = useRef(null);
  const [carousel, setCarousel] = useState({ time: 0, frame: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const frameCount = Children.count(children);

  const scrollToFrame = (frame) => {
    ref.current.scrollTo({
      left: (ref.current.clientWidth * frame),
      behavior: 'smooth',
    });
  };

  const handleTouchMove = () => {
    setIsDragging(true);
    const frame = Math.round(ref.current.scrollLeft / ref.current.clientWidth);
    if (carousel.frame !== frame) {
      setCarousel((prevCarousel) => ({ ...prevCarousel, frame }));
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!ref.current.matches(':hover') && !isDragging) {
        setCarousel(currentCarousel => {
          let newTime = currentCarousel.time + UNIT_TIME;
          let newFrame = currentCarousel.frame;

          if (currentCarousel.time === timeInterval) {
            newFrame = (currentCarousel.frame + 1) % frameCount;
            newTime %= timeInterval;
            scrollToFrame(newFrame);
          }
          return { time: newTime, frame: newFrame };
        });
      }
    }, UNIT_TIME);

    return () => {
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  return (
    <div
      className={
        classNames([{ [className]: className }])
      }
      onTouchMove={handleTouchMove}
    >
      <div className="rolling-carousel-slides" ref={ref}>
        {children}
      </div>
      <Indicator
        carousel={carousel}
        frameCount={frameCount}
        setCarousel={setCarousel}
        scrollToFrame={scrollToFrame}
        timeInterval={timeInterval}
        className={indicatorClassName}
        handleDotClick={handleDotClick}
        disableTransition={disableTransition}
      />
    </div>
  );
}

Carousel.protoTypes = {
  className: PropTypes.string,
  timeInterval: PropTypes.number.isRequired,
};

export default Carousel;
