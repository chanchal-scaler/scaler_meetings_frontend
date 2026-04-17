import { createContext } from 'react';

const OnboardingCarouselContext = createContext({
  currentStageIndex: null,
  handleNext: () => { },
  handleGoTo: () => { },
  handleBack: () => { },
});

export default OnboardingCarouselContext;
