import React, {
  Children, cloneElement, useCallback, useEffect, useState,
} from 'react';
import { unstable_batchedUpdates as batch } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { isFunction } from '@common/utils/type';
import SVGMask from '../SVGMask';
import uiManager from '@common/ui/uiManager';

function TourGuide({
  children,
  className,
  name,
  onTourEnd,
  onNavigateForward,
}) {
  const [isOpen, setOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const numSlides = Children.count(children);

  useEffect(() => {
    function handleStart(options) {
      // We want these states updates to cause only single render and because
      // these states are not being set has a result of native event handlers
      // react does not batch the updates here so we take the responsibility
      // of batching
      batch(() => {
        setSlideIndex(options.initialSlide);
        setOpen(true);
      });
    }

    function handleEnd() {
      setOpen(false);
    }

    uiManager.on(`${name}.start`, handleStart);
    uiManager.on(`${name}.end`, handleEnd);

    return () => {
      uiManager.off(`${name}.start`, handleStart);
      uiManager.off(`${name}.start`, handleEnd);
    };
  }, [name]);

  const handleNavigateBack = useCallback(() => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  }, [slideIndex]);

  const handleNavigateForward = useCallback(() => {
    if (slideIndex < numSlides - 1) {
      setSlideIndex(slideIndex + 1);

      if (isFunction(onNavigateForward)) {
        onNavigateForward(slideIndex + 1);
      }
    } else {
      setSlideIndex(0);
      setOpen(false);

      if (isFunction(onTourEnd)) {
        onTourEnd();
      }
    }
  }, [numSlides, onNavigateForward, onTourEnd, slideIndex]);

  if (isOpen) {
    const currentSlide = Children.toArray(children)[slideIndex];
    return (
      <div
        className={classNames(
          'tour-guide',
          { [className]: className },
        )}
      >
        <SVGMask
          highlightSelector={currentSlide.props.selector}
          padding={currentSlide.props.maskPadding}
          isVisible={isOpen}
        />
        {cloneElement(currentSlide, {
          key: 'current-slide',
          canNavigateBack: slideIndex > 0,
          onNavigateBack: handleNavigateBack,
          onNavigateForward: handleNavigateForward,
          isActive: isOpen,
          isLast: slideIndex === numSlides - 1,
        })}
      </div>
    );
  } else {
    return null;
  }
}

TourGuide.propTypes = {
  name: PropTypes.string.isRequired,
  onTourEnd: PropTypes.func,
  onNavigateForward: PropTypes.func,
};

export default TourGuide;
