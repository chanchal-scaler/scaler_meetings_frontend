import React, { memo, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import CarouselFooter from './CarouselFooter';
import OnboardingCarouselContext from './context';

function reducer(state, action) {
  switch (action.type) {
    case 'NEXT':
      return {
        ...state,
        currentStageIndex: state.currentStageIndex + 1,
      };
    case 'BACK':
      return {
        ...state,
        currentStageIndex: state.currentStageIndex - 1,
      };
    case 'GOTO':
      return {
        ...state,
        currentStageIndex: action.payload,
      };
    default:
      return state;
  }
}

const OnboardingCarousel = ({
  slidesMap,
  onComplete,
  enableGotoNavigation = false,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    currentStageIndex: 0,
  });
  const { currentStageIndex } = state;
  const onboardingSlides = Object.keys(slidesMap);
  const currentStageName = onboardingSlides[currentStageIndex];
  const currentStageRenderer = slidesMap[currentStageName];

  /**
   * @function
   * triggered when the next button is clicked.
   */
  const handleNext = useCallback(() => {
    dispatch({ type: 'NEXT' });
  }, []);

  /**
   * @function
   * triggered when the previous button is clicked.
   */
  const handleBack = useCallback(() => {
    dispatch({ type: 'BACK' });
  }, []);

  /**
   * @function
   * triggered when any indicator is clicked.
   * (works only when enableGotoNavigation is set to true)
   */
  const handleGoTo = useCallback((index) => {
    if (enableGotoNavigation) dispatch({ type: 'GOTO', payload: index });
  }, [enableGotoNavigation]);

  return (
    <OnboardingCarouselContext.Provider
      value={{
        currentStageIndex,
        handleNext,
        handleGoTo,
        handleBack,
      }}
    >
      <div className="onboarding-carousel-container">
        {
          currentStageName
            && currentStageRenderer()
        }
        <CarouselFooter
          numberOfSlides={onboardingSlides.length}
          onComplete={onComplete}
          enableGotoNavigation={enableGotoNavigation}
        />
      </div>
    </OnboardingCarouselContext.Provider>
  );
};


OnboardingCarousel.propTypes = {
  slidesMap: PropTypes.object,
  onComplete: PropTypes.func,
  enableGotoNavigation: PropTypes.bool,
};

export default memo(OnboardingCarousel);
