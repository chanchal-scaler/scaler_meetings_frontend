import { debugLog, isDevelopment } from '@common/utils/debug';
import { getRequestSource } from './platform';
import { isOfType, isString } from './type';

let queue = [];

function matchesIgnorePattern(pattern, message) {
  if (!isString(message)) return false;

  if (isString(pattern)) {
    return message.includes(pattern);
  } else if (isOfType(pattern, RegExp)) {
    return pattern.test(message);
  } else {
    return false;
  }
}

function shouldIgnore(message, data) {
  // Ignore errors received from server as they will be caught by ruby project
  // if needed
  if (data?.isFromServer) {
    return true;
  }

  if (window.__SENTRY__ && window.Sentry) {
    return window.__SENTRY__.ignoreErrors.some(pattern => {
      const messages = [message, data?.message].filter(Boolean);
      return messages.some(o => matchesIgnorePattern(pattern, o));
    });
  }

  return false;
}

function publishQueue() {
  const { Sentry } = window;
  if (!Sentry) return;

  queue.forEach(([type, message, data]) => {
    try {
      if (shouldIgnore(message, data)) return;

      Sentry.withScope(scope => {
        scope.setLevel(type);
        scope.setExtra('data', data);
        scope.setTag('request.source', getRequestSource());
        Sentry.captureException(new Error(message));
      });
    } catch (error) {
      // Ignore error
    }
  });

  queue = [];
}

// eslint-disable-next-line
export function logEvent(type, message, data) {
  if (isDevelopment()) {
    debugLog(type, message, { data });
  } else {
    queue.push([type, message, data]);
    publishQueue();
  }
}
