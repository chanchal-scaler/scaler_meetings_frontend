/* eslint-disable no-shadow */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';
import classNames from 'classnames';

import { forwardRef } from '@common/ui/hoc';
import { getScrollHandlingEntity, getScrollingParent } from '@common/utils/dom';
import { isNullOrUndefined, isNumber, isString } from '@common/utils/type';
import { warn } from '@common/utils/debug';
import StyleScope from './StyleScope';

export const PopoverScrollBehaviours = {
  close: 'close',
  scroll: 'scroll',
  disabled: 'disabled',
};

// Other constants
const allPlacements = ['left', 'top', 'right', 'bottom', 'leftBottom'];
const numPlacements = allPlacements.length;
const defaultMargin = { top: 0, left: 0 };
const scrollThrottle = parseInt(1000 / 60, 10); // For 60fps

// Initial States
const initialPosition = { top: 0, left: 0 };
const initialCalculated = false;

/**
 * A core `Popover` component which can be used in all cases where we want to
 * show some content on top of other elements in reference to some other
 * elements position.
 * Forms the base for many such components like `Tooltip`, `Dropdown` etc.
 *
 * ## Controling the Popover's position in reference to the anchor
 * This component provides 2 ways to control the popovers position
 *
 * 1. `placement` - This is an enum and only accepts one of the following
 * values 'left', 'top', 'right', 'bottom' and will position the popover in
 * the specified side of the anchor. If it is unable to fit the popover in the
 * given side it renders it on the side where it fits perfectly.
 *
 * 2. `location` - This prop gives more control over the position of the
 * popover. It accepts an object with 2 keys `top|bottom` and `left|right`
 * which specify position of the popover in pixels or percent string relative
 * to the anchor. This positioning works similar to how absolute position works
 * and the relative parent in this case would be anchor. When using this prop
 * it is the responsibility of the developer to make sure the popover fits in
 * the windows bounds.
 */
function Popover({
  anchorRef,
  className,
  scrollBehaviour = PopoverScrollBehaviours.close,
  component = 'div',
  container = document.body,
  extraScope,
  forcePlacement = false,
  forwardedRef,
  isOpen = false,
  location,
  margin,
  onClose,
  placement = 'bottom',
  style = {},
  resetPosition,
  getValidPosition,
  ...remainingProps
}) {
  const popoverRef = useRef(null);

  const [position, setPosition] = useState(initialPosition);
  const [calculated, setCalculated] = useState(initialCalculated);

  const scrollingElement = anchorRef.current
    ? getScrollingParent(anchorRef.current)
    : document.scrollingElement;

  function handleScroll() {
    if (scrollBehaviour === PopoverScrollBehaviours.disabled) {
      scrollingElement.style.overflow = 'hidden';

      return () => { scrollingElement.style.overflow = 'auto'; };
    } else {
      const closeOnScroll = scrollBehaviour === PopoverScrollBehaviours.close;
      const handleScroll = throttle(() => {
        if (closeOnScroll) {
          onClose();
        } else {
          // eslint-disable-next-line no-use-before-define
          updatePosition();
        }
      }, scrollThrottle, { leading: true });

      const scrollEntity = getScrollHandlingEntity(scrollingElement);
      scrollEntity.addEventListener(
        'scroll',
        handleScroll,
        { once: closeOnScroll },
      );

      return () => scrollEntity.removeEventListener('scroll', handleScroll);
    }
  }

  function calculateMargin() {
    return { ...defaultMargin, ...margin || {} };
  }

  function isValidPosition(elementRect, position) {
    const elementTop = position.top;
    const elementBottom = elementTop + elementRect.height;

    const viewportTop = container.scrollTop;
    const viewportBottom = viewportTop + container.offsetHeight;

    const canFitVertically = (
      (elementBottom < viewportBottom) && (elementTop > viewportTop)
    );

    const elementLeft = position.left;
    const elementRight = elementLeft + elementRect.width;

    const viewportLeft = container.scrollLeft;
    const viewportRight = viewportLeft + container.offsetWidth;

    const canFitHorizontally = (
      (elementRight < viewportRight)
      && (elementLeft > viewportLeft)
    );

    return canFitHorizontally && canFitVertically;
  }

  function calculateOrigin() {
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return {
      top: anchorRect.top - containerRect.top,
      left: anchorRect.left - containerRect.left,
    };
  }

  function calculatePosition(placement) {
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const relativePostion = calculateOrigin();

    const finalMargin = calculateMargin();
    let top = 0; let
      left = 0;
    switch (placement) {
      case 'left':
        left = relativePostion.left - popoverRect.width;
        top = relativePostion.top
          + (anchorRect.height / 2) - (popoverRect.height / 2);
        break;
      case 'top':
        left = relativePostion.left
          + (anchorRect.width / 2) - (popoverRect.width / 2);
        top = relativePostion.top - popoverRect.height;
        break;
      case 'right':
        left = relativePostion.left + anchorRect.width;
        top = relativePostion.top
          + (anchorRect.height / 2) - (popoverRect.height / 2);
        break;
      case 'bottom':
        left = relativePostion.left
          + (anchorRect.width / 2) - (popoverRect.width / 2);
        top = relativePostion.top + anchorRect.height;
        break;
      case 'leftBottom':
        left = relativePostion.left;
        top = relativePostion.top + anchorRect.height;
        break;
      default:
        // eslint-disable-next-line
        console.error('Invalid placement given to popover', placement);
    }

    top += finalMargin.top;
    left += finalMargin.left;
    return { top, left };
  }

  function calculatePositionFromPlacement() {
    if (forcePlacement) {
      return calculatePosition(placement);
    }

    const popoverRect = popoverRef.current.getBoundingClientRect();

    if (getValidPosition) {
      const position = calculatePosition(placement);
      if (isValidPosition(popoverRect, position)) {
        return position;
      } else {
        return getValidPosition({ container, popoverRect, position });
      }
    }

    let position;
    let placementsChecked = 0;
    let placementIndex = allPlacements.indexOf(placement);
    while (placementsChecked < numPlacements) {
      const placementToCheck = allPlacements[placementIndex % numPlacements];
      position = calculatePosition(placementToCheck);
      if (isValidPosition(popoverRect, position)) {
        break;
      }

      placementsChecked += 1;
      placementIndex += 1;
    }

    if (!isValidPosition(popoverRect, position)) {
      position = calculatePosition(placement);
    }

    return position;
  }

  function calculatePercentage(str) {
    const value = parseInt(str, 10);

    if (Number.isNaN(value)) {
      warn('Invalid percentage specified');
      return null;
    }

    return value / 100;
  }

  function calculatePositionFromLocation() {
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const origin = calculateOrigin();

    const position = {};
    if (!isNullOrUndefined(location.left)) {
      let left = 0;
      if (isNumber(location.left)) {
        left = location.left;
      } else if (isString(location.left)) {
        const percent = calculatePercentage(location.left);
        if (percent) {
          left = percent * anchorRect.width;
        }
      }
      position.left = origin.left + left;
    }

    if (!isNullOrUndefined(location.right)) {
      let right = 0;
      if (isNumber(location.right)) {
        right = location.right;
      } else if (isString(location.right)) {
        const percent = calculatePercentage(location.right);
        if (percent) {
          right = (percent * anchorRect.width);
        }
      }
      position.left = (
        origin.left + anchorRect.width - popoverRect.width - right
      );
    }

    if (!isNullOrUndefined(location.top)) {
      let top = 0;
      if (isNumber(location.top)) {
        top = location.top;
      } else if (isString(location.top)) {
        const percent = calculatePercentage(location.top);
        if (percent) {
          top = percent * anchorRect.height;
        }
      }
      position.top = origin.top + top;
    }

    if (!isNullOrUndefined(location.bottom)) {
      let bottom = 0;
      if (isNumber(location.bottom)) {
        bottom = location.bottom;
      } else if (isString(location.bottom)) {
        const percent = calculatePercentage(location.bottom);
        if (percent) {
          bottom = percent * anchorRect.height;
        }
      }
      position.top = (
        origin.top + anchorRect.height - popoverRect.height - bottom
      );
    }

    return position;
  }

  function getPortalContainer() {
    // If scrolling element is html then we can't add popover to it. In such
    // case we will want to use body as container
    if (container.tagName === 'HTML') {
      return window.document.body;
    } else {
      return container;
    }
  }

  function getStyle() {
    return {
      top: position.top,
      left: position.left,
      opacity: calculated ? 1 : 0,
      ...style,
    };
  }

  function updatePosition() {
    let position;
    if (isNullOrUndefined(location)) {
      position = calculatePositionFromPlacement();
    } else {
      position = calculatePositionFromLocation();
    }

    setPosition(position);
  }

  const resetState = useCallback(() => {
    setPosition(initialPosition);
    setCalculated(initialCalculated);
  }, []);

  // Hook that calculates where popover should be rendered
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      setCalculated(true);
      return handleScroll();
    } else {
      resetState();
    }
    // Below line makes this hook to be called only when `isOpen`
    // or `resetPosition` changes
    // eslint-disable-next-line
  }, [isOpen, resetPosition]);

  const attachRef = useCallback(el => {
    popoverRef.current = el;

    if (typeof forwardedRef === 'function') {
      forwardedRef(el);
    } else if (forwardedRef) {
      // eslint-disable-next-line no-param-reassign
      forwardedRef.current = el;
    }
  }, [forwardedRef]);

  function popoverUi() {
    return (
      <StyleScope
        className={classNames(
          'react-root--auto',
          { [extraScope]: extraScope },
        )}
        component={component}
      >
        {React.createElement(
          component,
          {
            className: classNames(
              'popover',
              { [className]: className },
            ),
            ref: attachRef,
            style: getStyle(),
            'data-sr-override': true,
            ...remainingProps,
          },
        )}
      </StyleScope>
    );
  }

  if (isOpen) {
    return createPortal(
      popoverUi(),
      getPortalContainer(),
    );
  } else {
    return null;
  }
}

Popover.propTypes = {
  anchorRef: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  closeOnScroll: PropTypes.bool,
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
  ]).isRequired,
  forcePlacement: PropTypes.bool,
  getValidPosition: PropTypes.func,
  isOpen: PropTypes.bool,
  margin: PropTypes.exact({
    left: PropTypes.number,
    top: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  placement: PropTypes.oneOf(allPlacements),
  scrollBehaviour: PropTypes.oneOf(
    Object.values(PopoverScrollBehaviours),
  ).isRequired,
  location: PropTypes.object,
};

export default forwardRef(Popover);
