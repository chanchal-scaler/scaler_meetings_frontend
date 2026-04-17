import React, { memo, useContext } from 'react';
import classNames from 'classnames';
import Tappable from '../Tappable';
import Icon from '../Icon';
import OnboardingCarouselContext from './context';

const Indicators = memo(({ numberOfSlides, enableGotoNavigation }) => {
  const {
    currentStageIndex,
    handleGoTo,
  } = useContext(OnboardingCarouselContext);

  const indicatorsArray = Array.from(
    { length: numberOfSlides }, (_, index) => index,
  );

  const indicators = indicatorsArray.map((index) => (
    <div
      key={index}
      className={
        classNames(
          'onboarding-carousel__indicator',
          {
            'onboarding-carousel__active-indicator':
            index === currentStageIndex,
          },
          { 'onboarding-carousel__cursor-pointer': enableGotoNavigation },
        )
      }
      onClick={() => handleGoTo(index)}
      role="none"
    />
  ));

  return <div className="onboarding-carousel__indicators">{indicators}</div>;
});

const CarouselFooter = ({
  numberOfSlides, onComplete,
  enableGotoNavigation = false,
}) => {
  const {
    currentStageIndex, handleNext, handleBack,
  } = useContext(OnboardingCarouselContext);

  return (
    <div className="onboarding-carousel__footer">
      <Indicators
        numberOfSlides={numberOfSlides}
        enableGotoNavigation={enableGotoNavigation}
      />
      <div className="onboarding-carousel__actions">
        {currentStageIndex > 0 && (
          <div
            className="onboarding-carousel__prev-btn"
            onClick={handleBack}
            role="none"
          >
            <Icon
              className="onboarding-carousel__action-icon"
              name="chevron-left"
            />
          </div>
        )}
        {currentStageIndex === numberOfSlides - 1 ? (
          <Tappable
            className="onboarding-carousel__action-btn"
            onClick={onComplete}
          >
            <span className="onboarding-carousel__action-btn-text">
              Continue
            </span>
          </Tappable>
        ) : (
          <Tappable
            className="onboarding-carousel__action-btn"
            onClick={handleNext}
          >
            <span className="onboarding-carousel__action-btn-text">Next</span>
            <Icon
              className="onboarding-carousel__action-icon"
              name="chevron-right"
            />
          </Tappable>
        )}
      </div>
    </div>
  );
};


export default memo(CarouselFooter);
