export function isOfType(data, type) {
  switch (type) {
    case 'array':
      return Array.isArray(data);
    case 'boolean':
    case 'function':
    case 'number':
    case 'string':
    case 'object':
      // eslint-disable-next-line valid-typeof
      return typeof data === type;
    default:
      return data instanceof type;
  }
}

export function isArray(data) {
  return isOfType(data, 'array');
}

export function isBoolean(data) {
  return isOfType(data, 'boolean');
}

export function isFunction(data) {
  return isOfType(data, 'function');
}

export function isNullOrUndefined(data) {
  return (data === null || data === undefined);
}

export function isNumber(data) {
  return isOfType(data, 'number');
}

export function isObject(data) {
  return isOfType(data, 'object');
}

// Useful in case of input fields to check if value is filled or not
// Return true in case of boolean value i.e return true even if value is `false`
export function isPresent(value) {
  return (!isNullOrUndefined(value) && value !== '');
}

export function isString(data) {
  return isOfType(data, 'string');
}
