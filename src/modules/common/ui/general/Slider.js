import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import clamp from 'lodash/clamp';

import { isFunction } from '@common/utils/type';
import { useDragHandlers } from '@common/hooks';

function Slider({
  className,
  disableControls = false,
  isVertical = false,
  label = true,
  max = 100,
  min = 0,
  onChangeStart,
  onChange,
  onChangeEnd,
  step = 1,
  value,
  ...remainingProps
}) {
  const sliderRef = useRef(null);
  const startRef = useRef(null);
  const [_value, setValue] = useState(value);

  const valueToPercent = useCallback(
    (v) => clamp(((v - min) * 100) / (max - min), 0, 100),
    [max, min],
  );

  const pixelToValue = useCallback((px) => {
    if (!sliderRef.current) {
      return 0;
    }

    const sliderEl = sliderRef.current;
    let maxLength = sliderEl.offsetWidth;
    let _px = px;
    if (isVertical) {
      maxLength = sliderEl.offsetHeight;
      _px = maxLength - _px;
    }
    const preciseValue = (_px / maxLength) * (max - min);
    const steppedValue = parseInt(preciseValue / step, 10) * step;
    return clamp(min + steppedValue, min, max);
  }, [isVertical, max, min, step]);


  const onDragStart = useCallback(({ startX, startY }) => {
    const seekbarEl = sliderRef.current;
    const { x, y } = seekbarEl.getBoundingClientRect();

    const diffX = startX - x;
    const diffY = startY - y;
    startRef.current = { startX: diffX, startY: diffY };

    let newValue = pixelToValue(diffX);
    if (isVertical) {
      newValue = pixelToValue(diffY);
    }
    setValue(newValue);

    if (onChangeStart) {
      onChangeStart();
    }

    if (onChange) {
      onChange(newValue);
    }
  }, [isVertical, onChange, onChangeStart, pixelToValue]);

  const onDrag = useCallback(({ diffX, diffY }) => {
    const { startX, startY } = startRef.current;
    const newX = startX + diffX;
    const newY = startY + diffY;
    let newValue = pixelToValue(newX);
    if (isVertical) {
      newValue = pixelToValue(newY);
    }

    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [isVertical, onChange, pixelToValue]);

  const onDragEnd = useCallback(() => {
    startRef.current = null;
    if (onChangeEnd) {
      onChangeEnd();
    }
  }, [onChangeEnd]);

  const { isDragging, ...handlers } = useDragHandlers({
    onDragStart,
    onDrag,
    onDragEnd,
  });

  useEffect(() => {
    if (!isDragging) {
      setValue(value);
    }
    // eslint-disable-next-line
  }, [value]);

  const percent = `${valueToPercent(_value)}%`;
  const trackStyleProperty = isVertical ? 'height' : 'width';
  const handleStyleProperty = isVertical ? 'bottom' : 'left';

  const dragHandlers = disableControls ? {} : handlers;
  return (
    <div
      ref={sliderRef}
      className={classNames(
        'sr-slider',
        { 'sr-slider--vertical': isVertical },
        { 'sr-slider--horizontal': !isVertical },
        { 'sr-slider--dragging': isDragging },
        { 'sr-slider--disabled-controls': disableControls },
        { [className]: className },
      )}
      {...remainingProps}
      {...dragHandlers}
    >
      <div className="sr-slider__track">
        <div
          className="sr-slider__progress"
          style={{ [trackStyleProperty]: percent }}
        />
      </div>
      {!disableControls && (
        <div
          className="sr-slider__handle"
          style={{ [handleStyleProperty]: percent }}
        >
          {label && (
            <div className="sr-slider__tooltip">
              {isFunction(label) ? label({ value }) : value}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Slider.propTypes = {
  disableControls: PropTypes.bool,
  isVertical: PropTypes.bool.isRequired,
  label: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
  max: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onChangeEnd: PropTypes.func,
  onChangeStart: PropTypes.func,
  step: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default Slider;
