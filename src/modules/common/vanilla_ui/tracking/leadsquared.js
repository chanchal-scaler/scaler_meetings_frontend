import { apiRequest } from '@common/api/utils';

async function postActivity(activityId, activityDesc, options) {
  try {
    await apiRequest(
      'POST',
      '/post-activity-lead-squared/',
      {
        activityId,
        activityDesc,
        ...options,
      },
    );
  } catch (e) {
    // Ignore
  }
}

export default {
  postActivity,
};
