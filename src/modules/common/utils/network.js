function listen(events, func, toAdd) {
  const fn = window[`${toAdd ? 'add' : 'remove'}EventListener`];
  events.split(' ').forEach(ev => {
    fn(ev, func);
  });
}

export function check() {
  return Promise.resolve(!navigator.onLine);
}

export function watch(cb) {
  const fn = () => check().then(cb);
  const listener = listen.bind(null, 'online offline', fn);
  listener(true);
  // return unsubscribe function
  return () => listener(false);
}
