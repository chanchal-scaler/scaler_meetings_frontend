import { Analytics } from '@vectord/analytics';
import pick from 'lodash/pick';

import { getEnvironmentId } from './environment';
import { isDevelopment } from './debug';
import userAnalyticsProfilesApi from '@common/api/userAnalyticsProfiles';

const environmentId = getEnvironmentId();

const analytics = new Analytics({
  app: 'unset',
  environment: environmentId,
  // Disabling by default for all apps will explicitly enable for select
  // apps one by one.
  isEnabled: false,
  // Disable analytics for interviewbit
  shouldTrack: !isDevelopment() && environmentId === 'scaler',
});

const EVENT_USER_ATTRIBUTES = [
  'mentee_status', 'mentee_is_paid', 'mentee_attendance',
  'mentee_job_search_status', 'mentee_psp', 'mentee_super_batch',
  'mentee_total_problem_solved', 'user_months_of_experience',
  'mentee_degree_enrollment_status', 'mentee_course_title',
];

// Guard to prevent multiple simultaneous calls to setLoggedInUser
let setLoggedInUserPromise = null;

export async function setLoggedInUser() {
  // Disable analytics for interviewbit
  if (environmentId !== 'scaler') return;

  // If a call is already in progress, wait for it to complete
  if (setLoggedInUserPromise) {
    await setLoggedInUserPromise;
    return;
  }

  // Create a new promise for this call
  setLoggedInUserPromise = (async () => {
    try {
      const json = await userAnalyticsProfilesApi.getCurrent();

      if (!json?.data) return;

      const {
        user_analytics_id: userAnalyticsId,
        ...userAttributes
      } = json.data.attributes;
      analytics.identify(userAnalyticsId);
      analytics.setUserAttributes(userAttributes);

      const eventUserAttributes = pick(userAttributes, EVENT_USER_ATTRIBUTES);
      analytics.setEventUserAttributes(eventUserAttributes);
    } finally {
      // Clear the promise after completion so it can be called again if needed
      setLoggedInUserPromise = null;
    }
  })();

  await setLoggedInUserPromise;
}


export default analytics;
