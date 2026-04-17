import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { forwardRef } from '@common/ui/hoc';
import { useGlobalState } from '~video_player/hooks';
import * as CustomPropTypes from '@common/utils/propTypes';

function TimeFollower({
  className,
  component = 'span',
  forwardedRef,
  style = {},
  time,
  ...remainingProps
}) {
  const [isCalculated, setCalculated] = useState(false);
  const [left, setLeft] = useState(0);
  const ref = useRef();
  const { containerEl, duration } = useGlobalState();

  useEffect(() => {
    const el = ref.current;
    if (el) {
      const maxRight = containerEl.offsetWidth;
      let newLeft = (time / duration) * maxRight;
      if (newLeft + el.offsetWidth > maxRight) {
        newLeft = maxRight - el.offsetWidth;
      }
      setLeft(newLeft);
      setCalculated(true);
    }
  }, [containerEl.offsetWidth, duration, time]);

  const attachRef = useCallback(el => {
    ref.current = el;

    if (typeof forwardedRef === 'function') {
      forwardedRef(el);
    } else if (forwardedRef) {
      // eslint-disable-next-line no-param-reassign
      forwardedRef.current = el;
    }
  }, [forwardedRef]);

  function getStyle() {
    return {
      ...style,
      left,
      opacity: isCalculated ? 1 : 0,
    };
  }

  if (time < duration) {
    return React.createElement(
      component,
      {
        ref: attachRef,
        className: classNames(
          'vp-time-follower',
          { [className]: className },
        ),
        style: getStyle(),
        ...remainingProps,
      },
    );
  } else {
    return null;
  }
}

TimeFollower.propTypes = {
  component: CustomPropTypes.componentPropType,
  time: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
};

export default forwardRef(TimeFollower);
