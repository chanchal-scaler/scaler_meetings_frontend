import { apiRequest } from './utils';

const analyticsCacheKey = '__API_CACHE__analytics';

function getUserTraits() {
  if (window[analyticsCacheKey]) {
    return window[analyticsCacheKey];
  }

  const response = apiRequest('GET', '/analytics/');
  window[analyticsCacheKey] = response;

  return response;
}


export default {
  getUserTraits,
};
