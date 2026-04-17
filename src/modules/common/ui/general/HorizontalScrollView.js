import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { isFunction } from '@common/utils/type';
import Icon from './Icon';
import Tappable from './Tappable';

const SCROLL_OFFSET = 50;

/**
 * Wraps children inside a horizontal scrolling container
 * @param arrowClassName {string}
 * @param leftArrowIcon {string}
 * @param rightArrowIcon {string}
 * @param className {string}
 * @param children {node}
 * @param containerClassName {string}
 * @param onScrollStartPosition {function}
 * Will execute multiple times
 * @param onScrollEndPosition {function}
 * Will execute multiple times
 * @param onScroll {function}
 * @param step {number}
 * @param gtmEventId
 * @param remainingProps {Object}
 * @param onArrowClick {function}
 * @returns {JSX.Element}
 */
function HorizontalScrollView({
  arrowClassName,
  arrowClassNameLeft,
  arrowClassNameRight,
  leftArrowIcon,
  rightArrowIcon,
  className,
  children,
  containerClassName,
  onScrollStartPosition = () => { },
  onScrollEndPosition = () => { },
  onScroll = () => { },
  step = SCROLL_OFFSET * 4,
  gtmEventId,
  variant,
  onArrowClick,
  ...remainingProps
}) {
  const scrollRef = useRef();
  const scrollHandlerRef = useRef();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleArrowVisibility = useCallback(event => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const maxScrollOffset = scrollEl.scrollWidth - scrollEl.offsetWidth;
    const currentScrollOffset = scrollEl.scrollLeft;

    if (maxScrollOffset === 0) {
      setShowLeftArrow(false);
      setShowRightArrow(false);
      return;
    }

    if (maxScrollOffset < SCROLL_OFFSET) {
      return;
    }

    const reachedStartingPosition = currentScrollOffset <= SCROLL_OFFSET;
    const reachedEndingPosition = (maxScrollOffset - currentScrollOffset)
      <= SCROLL_OFFSET;

    if (reachedStartingPosition) {
      onScrollStartPosition(event);
    }

    if (reachedEndingPosition) {
      onScrollEndPosition(event);
    }

    setShowLeftArrow(!reachedStartingPosition);
    setShowRightArrow(!reachedEndingPosition);
  }, [onScrollStartPosition, onScrollEndPosition]);

  const handleArrowClick = useCallback((event) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const direction = event.currentTarget.getAttribute('data-direction');
    const magnitude = direction === 'left' ? step * -1 : step;
    scrollEl.scrollTo({
      left: scrollEl.scrollLeft + magnitude,
      behavior: 'smooth',
    });
    onArrowClick?.(direction);
  }, [onArrowClick, step]);

  const handleResizeOfScrollableWindow = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    if (ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        handleArrowVisibility();
      });
      resizeObserver.observe(scrollEl);
    }
  }, [handleArrowVisibility]);

  const handleScroll = useCallback(event => {
    handleArrowVisibility(event);
    onScroll(event);
    if (gtmEventId && scrollHandlerRef && scrollHandlerRef.current) {
      scrollHandlerRef.current(event);
    }
  }, [gtmEventId, handleArrowVisibility, onScroll]);

  useEffect(() => {
    handleArrowVisibility();
    handleResizeOfScrollableWindow();
    scrollHandlerRef.current = window.TrackingHelper?.scrollTracker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return (
    <div
      className={classNames(
        'horizontal-scroll-view',
        { [containerClassName]: containerClassName },
      )}
    >
      <div
        {...gtmEventId ? {
          id: gtmEventId,
        } : {}}
        ref={scrollRef}
        className={classNames(
          'horizontal-scroll-view__items',
          { [className]: className },
        )}
        onScroll={handleScroll}
        {...remainingProps}
      >
        {
          isFunction(children)
            ? children({ rootRef: scrollRef.current })
            : children
        }
      </div>
      {showLeftArrow && (
        <Tappable
          data-direction="left"
          {...(gtmEventId ? {
            gtmEventType: 'button',
            gtmEventResult: `${gtmEventId}_prev`,
            gtmEventAction: 'click',
          } : {})}
          className={classNames(
            'btn btn-primary btn-icon btn-round',
            'horizontal-scroll-view__control',
            'horizontal-scroll-view__control--left',
            { [`horizontal-scroll-view__control--left-${variant}`]: variant },
            { [`horizontal-scroll-view__control--${variant}`]: variant },
            { [arrowClassName]: arrowClassName },
            { [arrowClassNameLeft]: arrowClassNameLeft },
          )}
          onClick={handleArrowClick}
          id="tappable-scroll-left"
        >
          {
            leftArrowIcon
              ? <Icon name={leftArrowIcon} />
              : <Icon name="arrow-left" />
          }
        </Tappable>
      )}
      {showRightArrow && (
        <Tappable
          data-direction="right"
          {...(gtmEventId ? {
            gtmEventType: 'button',
            gtmEventResult: `${gtmEventId}_next`,
            gtmEventAction: 'click',
          } : {})}
          className={classNames(
            'btn btn-primary btn-icon btn-round',
            'horizontal-scroll-view__control',
            'horizontal-scroll-view__control--right',
            { [`horizontal-scroll-view__control--right-${variant}`]: variant },
            { [`horizontal-scroll-view__control--${variant}`]: variant },
            { [arrowClassName]: arrowClassName },
            { [arrowClassNameRight]: arrowClassNameRight },
          )}
          id="tappable-scroll-right"
          onClick={handleArrowClick}
        >
          {
            rightArrowIcon
              ? <Icon name={rightArrowIcon} />
              : <Icon name="arrow-right" />
          }
        </Tappable>
      )}
    </div>
  );
}

HorizontalScrollView.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.array]).isRequired,
  arrowClassName: PropTypes.string,
  variant: PropTypes.string,
  containerClassName: PropTypes.string,
  step: PropTypes.number.isRequired,
  onScrollCallback: PropTypes.func,
  onScrollStartPositionCallback: PropTypes.func,
  onScrollEndPositionCallback: PropTypes.func,
  onArrowClick: PropTypes.func,
};

export default HorizontalScrollView;
