/* eslint-disable max-len */
import pickBy from 'lodash/pickBy';
import { isNullOrUndefined } from '@common/utils/type';

// eslint-disable-next-line import/prefer-default-export
export function getProperty(obj, property, defaultValue = false) {
  // eslint-disable-next-line no-prototype-builtins
  if (obj && obj.hasOwnProperty(property)) {
    return obj[property];
  } else {
    return defaultValue;
  }
}

export function bindContextToMethods(
  methodNames,
  bindContext,
  definitionContext = bindContext,
) {
  methodNames.forEach(methodName => {
    // eslint-disable-next-line no-param-reassign
    definitionContext[methodName] = definitionContext[methodName].bind(bindContext);
  });
}

export function removeEmptyKeys(data) {
  return pickBy(
    data,
    (v) => !isNullOrUndefined(v),
  );
}

export const isEmpty = (obj) => (
  obj && Object.keys(obj).length === 0
);
