/**
 * This file contains promise based version for common async functions which
 * are available through browser API's
 */

import { isFunction } from './type';
import { randomInt } from './random';

/**
 * Promise based version of `setTimeout`.
 * @param {function} fn
 * @param {number} timeout
 * @param {*} data - any type of data to return
 */
export function waitAndExecute(fn, timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (isFunction(fn)) {
        fn();
      }

      resolve();
    }, timeout);
  });
}

/**
 * Similar to `sleep` function available in most other languages
 * @param {number} timeout
 */
export function wait(timeout) {
  return waitAndExecute(null, timeout);
}

export function randomWait(min, max) {
  const timeout = randomInt(min, max);
  return wait(timeout);
}
