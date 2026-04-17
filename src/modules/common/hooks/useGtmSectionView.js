import { useEffect } from 'react';

/**
 * useGtmSectionView - provides functionality
 * for triggering GTM section view events.
 *
 * pushCondition will trigger the event
 *
 * *** Important - make sure otherEventAttributes (if any) are set
 * when pushCondition is met ***
 *
 */
function useGtmSectionView({
  sectionName, pushCondition, ...otherEventAttributes
}) {
  useEffect(() => {
    if (pushCondition) {
      window?.GTMtracker.pushEvent({
        event: 'gtm_section_view',
        data: {
          company: 'scaler',
          product: 'free_product',
          sub_product: 'drona-events',
          section_name: sectionName,
        },
        action: 'section_view',
        ...otherEventAttributes,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionName, pushCondition]);
}

export default useGtmSectionView;
