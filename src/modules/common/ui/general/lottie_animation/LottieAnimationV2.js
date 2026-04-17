import React, {
  useRef, useState, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import '@dotlottie/player-component';

import { isFunction } from '@common/utils/type';

/**
 * Play animations by passing a .json or a .lottie file as soure.
 * refer to
 * docs.lottiefiles.com/dotlottie-players/components/player-component/properties
 * for additional properties you can use.
 * @param {number} count - Number of times the animation should play.
 * Count starts from 0. (On setting the value to 2, animation plays 3 times)
 * Set count to -1 for playing only once. and 0 for infinite loop.
 */

function LottieAnimationV2({
  src,
  className,
  autoPlay = true,
  mode = 'bounce',
  speed = 1,
  onClick,
  count,
  ...props
}) {
  const ref = useRef();
  const [currentSource, setCurrentSource] = useState(src);
  const [currentSpeed, setCurrentSpeed] = useState(speed);

  useEffect(() => {
    setCurrentSource(src);
  }, [src]);

  useEffect(() => {
    setCurrentSpeed(speed);
  }, [speed]);

  useEffect(() => {
    const player = ref?.current;

    player?.load(currentSource);
  }, [currentSource]);

  useEffect(() => {
    const player = ref?.current;

    player?.setSpeed(currentSpeed);
  }, [currentSpeed]);

  const handleClick = useCallback(() => {
    if (isFunction(onClick)) {
      onClick();
    }
  }, [onClick]);

  return (
    <dotlottie-player
      ref={ref}
      src={currentSource}
      class={className}
      mode={mode}
      speed={currentSpeed}
      onClick={handleClick}
      count={count}
      {...autoPlay ? { autoPlay } : {}}
      {...props}
    />
  );
}


LottieAnimationV2.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string,
  autoPlay: PropTypes.bool,
  mode: PropTypes.oneOf(['normal', 'bounce']),
  speed: PropTypes.number,
  onClick: PropTypes.func,
  count: PropTypes.number,
};

export default LottieAnimationV2;
