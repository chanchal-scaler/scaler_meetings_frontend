import React, { memo } from 'react';
import classnames from 'classnames';
/**
 * This component acts as a template structure for all the onboarding stages.
 * It will take the required data (bannerImg, stageHeading, stageDescription)
 * as props and render them in the required format.
 */
const OnboardingCard = (
  {
    contentComponent = null,
    heading = '',
    description = '',
    className = '',
  },
) => (
  <section className={classnames(
    'onboarding-card',
    {
      [className]: className,
    },
  )}
  >
    <div className="onboarding-card__content-wrapper">
      {contentComponent}
    </div>
    <h3 className="onboarding-card__heading">{heading}</h3>
    <p className="onboarding-card__description">{description}</p>
  </section>
);

export default memo(OnboardingCard);
