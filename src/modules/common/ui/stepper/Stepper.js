import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Icon } from '@common/ui/general';
import { isNumber } from '@common/utils/type';

function Stepper({
  activeStep,
  children,
  className,
  dividerClassName,
  maxUnlockedStep,
  onRequestChange,
  ...remainingProps
}) {
  const numChildren = Children.count(children);

  function stepperItemUi(child, index) {
    const isLast = index + 1 === numChildren;
    const isActive = index === activeStep;
    const isLocked = isNumber(maxUnlockedStep) && (index > maxUnlockedStep);

    const propsToInject = {
      isActive,
      isLocked,
      onRequestChange,
      stepIndex: index,
    };

    return (
      <>
        {cloneElement(child, propsToInject)}
        {!isLast && (
          <div
            className={classNames(
              'stepper__divider',
              { [dividerClassName]: dividerClassName },
            )}
          >
            <Icon name="chevron-right" />
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={classNames(
        'stepper',
        { [className]: className },
      )}
      {...remainingProps}
    >
      {Children.map(children, stepperItemUi)}
    </div>
  );
}

Stepper.propTypes = {
  activeStep: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  dividerClassName: PropTypes.string,
  maxUnlockedStep: PropTypes.number,
  onRequestChange: PropTypes.func,
};

export default Stepper;
