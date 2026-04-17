import { isArray } from '@common/utils/type';

/**
 * Push item to array only if it is not already present in it.
 *
 * Returns `true` if push was successful
 */
export function pushUnique(arr, item) {
  if (arr.indexOf(item) === -1) {
    arr.push(item);
    return true;
  }

  return false;
}

/**
 *
 * @param {<T>|Array} singleOrArray
 * @returns {Array}
 */
export function ensureArray(singleOrArray) {
  if (!singleOrArray) return [];
  if (isArray(singleOrArray)) return singleOrArray;
  return [singleOrArray];
}
