import { PLUGINS } from './plugins';

/**
 * Registered Apps
 * CAUTION:
 * This is a list of apps that are registered with the analytics library.
 * Please contact module maintainers if you need to add a new app.
 */
export const APPS = {
  mentee: 'mentee',
  mentor: 'mentor',
  instructorReferral: 'instructor_referral',
  store: 'store',
  referrals: 'referrals',
  helpRequest: 'help_request',
  careersHub: 'careers-hub',
  problemSolving: 'problem',
  streak: 'streak',
  classroom: 'classroom',
  meetings: 'meetings',
  salesDashboard: 'sales_dashboard',
  profileStats: 'profile_stats',
  profile: 'profile',
  contest: 'contest',
  undergrad: 'undergrad',
  chatbot: 'chatbot',
  mba: 'mba',
};

/**
 * Registered Plugins App wise
 */
export const APP_WISE_ANALYTICS_TOOL_MAP = {
  [APPS.mentee]: [
    PLUGINS.mixpanel,
  ],
  [APPS.mentor]: [
    PLUGINS.mixpanel,
  ],
  [APPS.instructorReferral]: [
    PLUGINS.mixpanel,
  ],
  [APPS.store]: [
    PLUGINS.mixpanel,
  ],
  [APPS.referrals]: [
    PLUGINS.mixpanel,
  ],
  [APPS.helpRequest]: [
    PLUGINS.mixpanel,
  ],
  [APPS.careersHub]: [
    PLUGINS.mixpanel,
  ],
  [APPS.problemSolving]: [
    PLUGINS.mixpanel,
  ],
  [APPS.streak]: [
    PLUGINS.mixpanel,
  ],
  [APPS.classroom]: [
    PLUGINS.mixpanel,
  ],
  [APPS.meetings]: [
    PLUGINS.mixpanel,
  ],
  [APPS.salesDashboard]: [
    PLUGINS.mixpanel,
  ],
  [APPS.profileStats]: [
    PLUGINS.mixpanel,
  ],
  [APPS.profile]: [
    PLUGINS.mixpanel,
  ],
  [APPS.contest]: [
    PLUGINS.mixpanel,
  ],
  [APPS.undergrad]: [
    PLUGINS.mixpanel,
  ],
  [APPS.chatbot]: [
    PLUGINS.mixpanel,
  ],
  [APPS.mba]: [
    PLUGINS.mixpanel,
  ],
};
