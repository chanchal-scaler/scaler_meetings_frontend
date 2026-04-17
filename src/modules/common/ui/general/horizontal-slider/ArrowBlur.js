import React from 'react';
import classnames from 'classnames';

const ArrowBlur = ({ totalColumns, activeColumn }) => {
  const showLeftBlur = activeColumn !== 1;
  const showRightBlur = activeColumn !== totalColumns;

  return (
    <>
      {showLeftBlur && (
        <div
          className={classnames(
            'horizontal-slider__arrow-blur',
            'horizontal-slider__arrow-blur--left',
          )}
        />
      )}
      {showRightBlur && (
        <div
          className={classnames(
            'horizontal-slider__arrow-blur',
            'horizontal-slider__arrow-blur--right',
            { hidden: activeColumn === totalColumns },
          )}
        />
      )}
    </>
  );
};

export default ArrowBlur;
