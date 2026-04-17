import { setCookie, getCookie } from '@common/utils/cookie';

const COOKIE_EXPIRY_MINUTES = 43200; // 30 days
const EXPERIMENTS_COOKIE = 'experiments';

const getCurrentExperiments = () => {
  const experiments = {};
  const experimentCookieVal = getCookie(EXPERIMENTS_COOKIE);
  if (experimentCookieVal) {
    const experimentsArr = experimentCookieVal.split(';');
    experimentsArr.forEach((experiment) => {
      const [key, val] = experiment.split(':');
      experiments[key] = val;
    });
  }

  return experiments;
};

export function initializeAbTestTracking() {
  const elements = document.querySelectorAll('[data-variant-key]');
  const variants = [];
  const experiments = getCurrentExperiments();
  const currentPageExperiments = {};
  let experimentCookieVal = '';
  elements.forEach((element) => {
    const key = element.getAttribute('data-variant-key');
    const value = element.getAttribute('data-variant-value');
    if (key && value) {
      variants.push(value);
      currentPageExperiments[key] = value;
      experimentCookieVal += `${key}:${value};`;
    }
  });
  Object.keys(experiments).forEach((key) => {
    if (!experimentCookieVal.includes(key)) {
      experimentCookieVal += `${key}:${experiments[key]};`;
    }
  });

  if (experimentCookieVal !== '') {
    const d = new Date();
    d.setTime(d.getTime() + (COOKIE_EXPIRY_MINUTES * 60 * 1000));
    setCookie(
      EXPERIMENTS_COOKIE,
      experimentCookieVal,
      { expires: d.toUTCString() },
    );
  }

  window.TrackingHelper?.setContext('ab_test', {
    experiments: variants.join(','),
    ab_experiments: currentPageExperiments,
  });
}
