import { initializeAbTestTracking } from '@common/utils/abTestTracking';
import { getDeviceType, isScalerMobileApp } from '@common/utils/platform';
import { PLATFORMS, PRODUCTS } from './constants';

export const getPlatform = () => {
  let platform = getDeviceType();
  if (isScalerMobileApp()) {
    platform = PLATFORMS.SCALER_ANDROID;
  }

  return platform;
};

export function getProduct(url) {
  const urlPathArrs = url.split('/');
  if (urlPathArrs.includes('events')) {
    return PRODUCTS.EVENTS_PAGE;
  } else if (urlPathArrs.includes('event')) {
    return PRODUCTS.EVENT_PAGE;
  } else if (urlPathArrs.includes('courses')) {
    return PRODUCTS.COURSES_PAGE;
  } else if (urlPathArrs.includes('career-plan')) {
    return PRODUCTS.CRT_PAGE;
  } else if (urlPathArrs.includes('meetings')) {
    return PRODUCTS.MEETINGS_PAGE;
  } else if (
    (
      urlPathArrs.includes('academy')
        || urlPathArrs.includes('data-science-course')
    )
    && urlPathArrs.includes('test')) {
    return PRODUCTS.TEST_PAGE;
  } else if (urlPathArrs.includes('mentee-dashboard')) {
    return PRODUCTS.MENTEE_DASHBOARD_PAGE;
  } else if (urlPathArrs.includes('mentee-dashboard')) {
    return PRODUCTS.MENTEE_DASHBOARD_PAGE;
  } else if (urlPathArrs.includes('academy')) {
    return PRODUCTS.ACADEMY_PAGE;
  } else if (urlPathArrs.includes(('data-science-course'))) {
    return PRODUCTS.DATASCIENCE_PAGE;
  } else if (urlPathArrs.includes(('ai-machine-learning-course'))) {
    return PRODUCTS.AIML_PAGE;
  } else if (urlPathArrs.includes('neovarsity')) {
    return PRODUCTS.NEOVARSITY_PAGE;
  } else if (urlPathArrs.includes('review')) {
    return PRODUCTS.REVIEW_PAGE;
  } else if (urlPathArrs.every(ele => ele === '')) {
    return PRODUCTS.HOME_PAGE;
  } else if (urlPathArrs.includes('devops-course')) {
    return PRODUCTS.DEVOPS_PAGE;
  }

  return null;
}

const setAbExperiment = () => {
  const abTestData = window.TrackingHelper?.getContext('ab_test') || {};
  if (!Object.prototype.hasOwnProperty.call(abTestData, 'experiments')) {
    initializeAbTestTracking();
  }

  return window.TrackingHelper?.getContext('ab_test')?.experiments;
};

export function setAttribution(intent, data = {}) {
  const { pathname } = window.location;
  const pagePath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  window.TrackingHelper?.setContext(
    'lead_registration_info',
    {
      intent,
      ...data,
      platform: getPlatform(),
      product: getProduct(pagePath),
      experiment: setAbExperiment(),
    },
  );
}


export function getAttribution() {
  return window.TrackingHelper?.getContext('lead_registration_info');
}
