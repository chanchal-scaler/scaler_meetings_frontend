import localForage from 'localforage';

import { USER_ID, USER_TRAITS } from '~analytics/utils/storage';

export const analyticsStorage = localForage.createInstance({
  description: 'Storage for analytics data',
  driver: [localForage.INDEXEDDB, localForage.WEBSQL, localForage.LOCALSTORAGE],
  name: 'analytics',
});

export async function getPersistedUserData() {
  const userId = await analyticsStorage.getItem(USER_ID);
  const traits = await analyticsStorage.getItem(USER_TRAITS);
  return {
    userId,
    traits,
  };
}
