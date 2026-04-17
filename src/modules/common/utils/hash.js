import { isString } from '@common/utils/type';

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest

async function getStringHash(message, algorithm = 'SHA-256') {
  // encode as (utf-8) Uint8Array
  const msgUint8 = new TextEncoder().encode(message);

  const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);

  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function getHash(obj) {
  if (isString(obj)) {
    return getStringHash(obj);
  }

  return getStringHash(JSON.stringify(obj));
}

/**
 * Converts keys to numbers, sort and return an array
 * The default behavior considers keys will be numbers or numbers as strings
 * Only of order of keys is used and not the actual numbers
 *
 * @param {hash} object
 * @param {boolean} returnKeys
 * @param {function} keyParser
 * @param {function} filter
 */
export function hashToArray(
  hash,
  returnKeys = false,
  keyParser = parseInt,
  filter = null,
) {
  let keys = Object.keys(hash).map(key => keyParser(key));
  if (filter)keys = keys.filter(key => filter(key, hash[key]));
  // can make a provision to use a passed custom comparator
  let ans = keys.sort();
  if (!returnKeys)ans = ans.map(key => hash[key]);
  return ans;
}
