export function generateActionType(namespace, action) {
  return [namespace, action].join('/');
}

export function generateActionCreator(namespace, action) {
  return function (payload) {
    return {
      type: generateActionType(namespace, action),
      payload,
    };
  };
}
