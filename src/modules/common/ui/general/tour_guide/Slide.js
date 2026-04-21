import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import clamp from 'lodash/clamp';

import { isInViewport, scrollToElement } from '@common/utils/dom';
import { useWindowSize } from '@common/hooks';
import Icon from '../Icon';
import Tappable from '../Tappable';

const DEFAULT_TRANSFORM = { x: 0, y: 0 };

function Slide({
  canNavigateBack,
  children,
  className,
  isActive = false,
  isLast,
  maskPadding = 10,
  onNavigateBack,
  onNavigateForward,
  padding = 10,
  selector,
  style,
  endCtaText,
  ...remainingProps
}) {
  const ctaText = endCtaText || 'End Tour';
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [transform, setTransform] = useState(DEFAULT_TRANSFORM);
  const [animated, setAnimated] = useState(false);
  const slideRef = useRef(null);
  const prevTransfromRef = useRef(DEFAULT_TRANSFORM);
  const [highlightEl, setHighlightEl] = useState(null);

  useEffect(() => {
    let el = document.body;
    if (selector) {
      el = document.querySelector(selector);
    }
    setHighlightEl(el);
  }, [selector]);

  useEffect(() => {
    const prevTransfrom = prevTransfromRef.current;
    if (
      (transform.x === 0 && transform.y === 0)
      || (prevTransfrom.x === 0 && prevTransfrom.y === 0)
    ) {
      setAnimated(false);
    } else {
      setAnimated(true);
    }
    prevTransfromRef.current = transform;
  }, [transform]);

  // Hook that changes the position of slide
  useEffect(() => {
    if (!isActive || !highlightEl) return;

    function positionSlideAtCenter() {
      const slideEl = slideRef.current;

      if (!slideEl) return;

      setTransform({
        x: (windowWidth - slideEl.offsetWidth) / 2,
        y: (windowHeight - slideEl.offsetHeight) / 2,
      });
    }

    if (!isInViewport(highlightEl)) {
      scrollToElement(
        highlightEl,
        240,
        null,
        'auto',
      );
    }

    const {
      left, right, bottom, top,
    } = highlightEl.getBoundingClientRect();

    function usableSpace(space, maxSpace) {
      return clamp(space - (padding + maskPadding), 0, maxSpace);
    }


    function canPerfectlyPosition(availableWidth, availableHeight) {
      const {
        offsetHeight: slideHeight,
        offsetWidth: slideWidth,
      } = slideRef.current;

      return (availableWidth >= slideWidth && availableHeight >= slideHeight);
    }

    function calculatePositionForPlacement(available, placement) {
      const {
        offsetHeight: slideHeight,
        offsetWidth: slideWidth,
      } = slideRef.current;
      let availableWidth; let availableHeight;
      switch (placement) {
        case 'left':
          availableWidth = available.left;
          availableHeight = windowHeight - top + maskPadding;
          if (canPerfectlyPosition(availableWidth, availableHeight)) {
            return {
              x: availableWidth - slideWidth,
              y: top - maskPadding,
            };
          } else if (availableWidth >= slideWidth) {
            return {
              x: availableWidth - slideWidth,
              y: top - (slideHeight - availableHeight) - maskPadding,
            };
          }
          break;
        case 'top':
          availableWidth = windowWidth - left + maskPadding;
          availableHeight = available.top;
          if (canPerfectlyPosition(availableWidth, availableHeight)) {
            return {
              x: left - maskPadding,
              y: availableHeight - slideHeight,
            };
          } else if (availableHeight >= slideHeight) {
            return {
              x: left - (slideWidth - availableWidth) - maskPadding,
              y: availableHeight - slideHeight,
            };
          }
          break;
        case 'right':
          availableWidth = available.right;
          availableHeight = windowHeight - top + maskPadding;
          if (canPerfectlyPosition(availableWidth, availableHeight)) {
            return {
              x: windowWidth - availableWidth,
              y: top - maskPadding,
            };
          } else if (availableWidth >= slideWidth) {
            return {
              x: windowWidth - availableWidth,
              y: top - (slideHeight - availableHeight) - maskPadding,
            };
          }
          break;
        case 'bottom':
          availableWidth = windowWidth - left + maskPadding;
          availableHeight = available.bottom;
          if (canPerfectlyPosition(availableWidth, availableHeight)) {
            return {
              x: left - maskPadding,
              y: windowHeight - availableHeight,
            };
          } else if (availableHeight >= slideHeight) {
            return {
              x: left - (slideWidth - availableWidth) - maskPadding,
              y: windowHeight - availableHeight,
            };
          }
          break;
        default:
          return null;
      }

      return null;
    }

    function calculatePosition() {
      if (!slideRef.current) return;

      // Object which represents usable space in every direction
      const availableSpaces = {
        top: usableSpace(top, windowHeight - (padding + maskPadding)),
        left: usableSpace(left, windowWidth - (padding + maskPadding)),
        bottom: usableSpace(
          windowHeight - bottom,
          windowHeight - (padding + maskPadding),
        ),
        right: usableSpace(
          windowWidth - right,
          windowWidth - (padding + maskPadding),
        ),
      };

      const orderedSpaces = Object.keys(availableSpaces).map(placement => ({
        placement,
        space: availableSpaces[placement],
      })).sort((a, b) => b.space - a.space);

      let idealPosition;
      for (let i = 0; i < orderedSpaces.length; i += 1) {
        idealPosition = calculatePositionForPlacement(
          availableSpaces,
          orderedSpaces[i].placement,
        );
        if (idealPosition) break;
      }

      if (idealPosition) {
        setTransform(idealPosition);
      } else {
        positionSlideAtCenter();
      }
    }

    calculatePosition();
  }, [highlightEl, isActive, maskPadding, padding, windowHeight, windowWidth]);

  if (isActive) {
    return (
      <div
        ref={slideRef}
        className={classNames(
          'tour-guide-slide',
          { 'tour-guide-slide--animated': animated },
          { [className]: className },
        )}
        style={{
          ...style,
          transform: `translate(
            ${parseInt(transform.x, 10)}px, ${parseInt(transform.y, 10)}px)`,
        }}
        {...remainingProps}
      >
        <div className="tour-guide-slide__content">
          {children}
        </div>
        <div className="tour-guide-slide__actions">
          <Tappable
            className={classNames(
              'tour-guide-slide__control no-highlight',
              { 'tour-guide-slide__control--disabled': !canNavigateBack },
            )}
            onClick={onNavigateBack}
          >
            <Icon className="h3" name="chevron-left" />
          </Tappable>
          <Tappable
            data-cy="tour-guide-slide-close"
            className={classNames(
              'tour-guide-slide__control primary h5 no-highlight',
            )}
            onClick={() => onNavigateForward()}
          >
            {isLast ? ctaText : 'Next'}
          </Tappable>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

Slide.propTypes = {
  canNavigateBack: PropTypes.bool,
  isActive: PropTypes.bool,
  isLast: PropTypes.bool,
  maskPadding: PropTypes.number,
  onNavigateBack: PropTypes.func,
  onNavigateForward: PropTypes.func,
  padding: PropTypes.number,
  selector: PropTypes.string,
};

export default Slide;
