import { apiRequest } from './utils';
import { wait } from '@common/utils/async';

const RETRY_COUNT = 4;

async function getCurrentProfile(tryNum = 1) {
  try {
    const json = await apiRequest('GET', '/user-analytics-profiles/current');
    return json;
  } catch (error) {
    if (tryNum >= RETRY_COUNT) {
      throw error;
    } else {
      await wait(3000 * tryNum);
      return getCurrentProfile(tryNum + 1);
    }
  }
}

export default {
  getCurrent: getCurrentProfile,
};
