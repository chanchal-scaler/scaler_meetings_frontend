import { apiRequest } from '@common/api/utils';

async function sendEvents(events, params = {}) {
  if (events.length === 0) return [];

  const { processed_events: processedEventIds } = await apiRequest(
    'POST',
    `/recordings/events`,
    { events, ...params },
    { keepalive: true },
  );
  return processedEventIds;
}

export default {
  send: sendEvents,
};
