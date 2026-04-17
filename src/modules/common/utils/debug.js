export function isDevelopment() {
  return (process.env.NODE_ENV === 'development');
}

export function debugLog(logLevel, ...args) {
  if (isDevelopment()) {
    // eslint-disable-next-line
    console[logLevel](...args);
  }
}

export function info(...args) {
  debugLog('info', ...args);
}

export function log(...args) {
  debugLog('log', ...args);
}

export function warn(...args) {
  debugLog('warn', ...args);
}
