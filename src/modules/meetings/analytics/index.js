import { logEvent } from '@common/utils/logger';
import Analytics from '~analytics';
import analyticsApi from '@common/api/analytics';
import MixpanelPlugin from '~analytics/plugins/mixpanel';

const analytics = Analytics({
  app: 'meetings',
  plugins: [
    new MixpanelPlugin(),
  ],
}, async (analyticsInstance) => {
  try {
    const { data: { id, attributes } } = await analyticsApi.getUserTraits();
    analyticsInstance.identify(id, attributes);
  } catch (error) {
    logEvent(
      'error',
      'MeetingsAnalytics: Failed to initialise module',
      error,
    );
  }
});

export default analytics;
