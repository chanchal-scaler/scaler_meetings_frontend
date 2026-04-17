import React from 'react';
import { useTransition, animated } from '@react-spring/web';
import classNames from 'classnames';

import { pickReactSpringProps } from '@common/utils/animatable';

export default function SlideUp({
  children,
  className,
  isOpen,
  from = '100vh',
  to = '0vh',
  ...restProps
}) {
  const reactSpringProps = pickReactSpringProps(restProps);

  const transitions = useTransition(isOpen, {
    enter: {
      opacity: 1,
      transform: `translateY(${to})`,
    },
    leave: {
      opacity: 0,
      transform: `translateY(${from})`,
    },
    from: {
      opacity: 0,
      transform: `translateY(${from})`,
    },
    ...reactSpringProps,
  });

  return transitions(
    (styles, item) => item && (
      <animated.div
        className={classNames(
          { [className]: className },
        )}
        style={styles}
      >
        {children}
      </animated.div>
    ),
  );
}
