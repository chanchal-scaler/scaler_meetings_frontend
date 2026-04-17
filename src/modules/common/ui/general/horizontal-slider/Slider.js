import React from 'react';
import classnames from 'classnames';

const Slider = ({ totalColumns, activeColumn = 1 }) => (
  <div className="horizontal-slider__container row align-c">
    {Array(totalColumns).fill(0).map((_, index) => (
      <div
        key={index}
        className={classnames('horizontal-slider__bar', {
          'horizontal-slider__bar--active': activeColumn === index + 1,
        })}
      />
    ))}
  </div>
);

export default Slider;
