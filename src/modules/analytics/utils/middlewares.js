import { generateUUID } from '@common/utils/misc';
import { isFunction } from '@common/utils/type';
import { stack } from './callbackStack';

// Async promise resolver
function deferredPromiseResolver(resolver, callback) {
  return (data) => {
    if (callback) callback(data);
    resolver(data);
  };
}

/**
 * Grab first function found from arguments
 * @param {array} [argArray] - arguments array to find first function
 * @returns {Function|undefined}
 */
function getCallbackFromArgs(argArray) {
  const args = argArray || [];
  let cb;
  for (let i = 0; i < args.length; i += 1) {
    if (isFunction(args[i])) {
      cb = args[i]; break;
    }
  }
  return cb;
}

export default function generateMeta(meta = {}, resolve, possibleCallbacks) {
  const rid = generateUUID();
  if (resolve) {
    stack[rid] = deferredPromiseResolver(
      resolve, getCallbackFromArgs(possibleCallbacks),
    );
  }
  return {
    ...meta,
    rid,
    ts: new Date().getTime(),
    ...(!resolve) ? {} : { hasCallback: true },
  };
}
