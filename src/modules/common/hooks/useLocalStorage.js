import { useCallback, useEffect } from 'react';
import forOwn from 'lodash/forOwn';

import { isNullOrUndefined } from '@common/utils/type';
import LocalStorage from '@common/lib/localStorage';

const MAX_THRESHOLD = 5;

/**
 * Get, set and initialize ls values
 * @param {String} lsKey
 * @param {Object} initialState Maximum of 5 keys, for better optimisation
 */

function useLocalStorage(lsKey, initialState = {}) {
  const localStorage = LocalStorage.getInstance(lsKey);
  useEffect(() => {
    if (Object.keys(initialState).length > MAX_THRESHOLD) {
      throw new Error(
        'Max 5 keys can be initialized through useLocalStorage hook'
        + ' for better optimisation, please use'
        + ' other methods to get data from localstorage',
      );
    }
    forOwn(initialState, (v, k) => {
      if (isNullOrUndefined(localStorage[k])) {
        localStorage[k] = v;
      }
    });
  }, [initialState, localStorage]);

  const syncLocalStorage = useCallback((data) => {
    forOwn(data, (v, k) => {
      localStorage[k] = v;
    });
  }, [localStorage]);

  return [
    localStorage,
    syncLocalStorage,
  ];
}

export default useLocalStorage;
