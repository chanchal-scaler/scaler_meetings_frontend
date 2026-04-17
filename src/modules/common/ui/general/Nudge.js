import React, { createElement, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { componentPropType } from '@common/utils/propTypes';
import { isFunction } from '@common/utils/type';
import { ONE_DAY } from '@common/utils/date';
import { useCollapsable } from '@common/hooks';
import Icon from './Icon';
import Popover, { PopoverScrollBehaviours } from './Popover';
import Tappable from './Tappable';
import Triangle from './Triangle';

const TRIANGLE_SIZE = 24;
const MARGIN_SIZE = TRIANGLE_SIZE / Math.sqrt(2) + 1;
const marginMap = {
  top: { top: -MARGIN_SIZE },
  left: { left: -MARGIN_SIZE },
  right: { left: MARGIN_SIZE },
  bottom: { top: MARGIN_SIZE },
  bottomLeft: { top: MARGIN_SIZE },
  bottomRight: { top: MARGIN_SIZE },
  topLeft: { top: -MARGIN_SIZE },
  topRight: { top: -MARGIN_SIZE },
};

const trianglePlacementMap = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
  bottomLeft: 'top',
  bottomRight: 'top',
  topLeft: 'bottom',
  topRight: 'bottom',
};

const popoverPlacementPropsMap = {
  top: { placement: 'top' },
  left: { placement: 'left' },
  right: { placement: 'right' },
  bottom: { placement: 'bottom' },
  bottomLeft: { location: { top: '125%', left: -5 } },
  bottomRight: { location: { top: '125%', right: -5 } },
  topLeft: { location: { bottom: '125%', left: -5 } },
  topRight: { location: { bottom: '125%', right: -5 } },
};

function Nudge({
  children,
  closeOnClick = false,
  component = 'div',
  content,
  contentClassName,
  interval = ONE_DAY,
  isActive,
  name,
  numCloses = 3,
  onClick,
  placement,
  popoverProps = {},
  triangleProps = {},
  showCloseButton = true,
  ...remainingProps
}) {
  const ref = useRef();
  const [isVisible, onClose] = useCollapsable({
    key: name,
    interval,
    numCloses,
  });

  const handleClick = useCallback(() => {
    if (isActive && isVisible && closeOnClick) {
      onClose();
    }

    if (isFunction(onClick)) {
      onClick();
    }
  }, [closeOnClick, isActive, isVisible, onClick, onClose]);

  function popoverUi() {
    return (
      <Popover
        {...popoverProps}
        {...popoverPlacementPropsMap[placement]}
        anchorRef={ref}
        className={classNames(
          'nudge card card--elevated',
          { [contentClassName]: contentClassName },
        )}
        forcePlacement
        isOpen={isVisible && isActive}
        margin={marginMap[placement]}
        onClose={onClose}
        scrollBehaviour={PopoverScrollBehaviours.scroll}
      >
        <Triangle
          {...triangleProps}
          direction={trianglePlacementMap[placement]}
        />
        {showCloseButton && (
          <Tappable
            className="no-highlight nudge__action"
            onClick={onClose}
          >
            <Icon name="close" />
          </Tappable>
        )}
        <div className="nudge__content">
          {content}
        </div>
      </Popover>
    );
  }

  function contentUi() {
    return createElement(
      component,
      {
        ref,
        onClick: handleClick,
        ...remainingProps,
      },
      children,
    );
  }

  return (
    <>
      {contentUi()}
      {popoverUi()}
    </>
  );
}

Nudge.propTypes = {
  closeOnClick: PropTypes.bool,
  component: componentPropType,
  interval: PropTypes.number.isRequired,
  isActive: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  name: PropTypes.string.isRequired,
  numCloses: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  popoverProps: PropTypes.object,
};

export default Nudge;
