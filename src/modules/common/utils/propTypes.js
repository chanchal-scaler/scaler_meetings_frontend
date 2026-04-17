import { Children } from 'react';
import PropTypes from 'prop-types';

import { isArray } from './type';

export const componentPropType = PropTypes.oneOfType(
  [PropTypes.string, PropTypes.elementType, PropTypes.element],
);

export const numberStringPropType = PropTypes.oneOfType([
  PropTypes.string, PropTypes.number,
]);

export function arrayOfLength({ min, max, exact }) {
  return function (props, propName) {
    // eslint-disable-next-line react/destructuring-assignment
    const prop = props[propName];
    if (!isArray(prop)) {
      return new Error(`${propName} needs to be an array`);
    }

    if (exact && exact !== prop.length) {
      return new Error(`${propName} needs to be an array of length: ${exact}`);
    }

    if (min && min > prop.length) {
      return new Error(`${propName} length should no be less than ${min}`);
    }

    if (max && max < prop.length) {
      return new Error(`${propName} length should no be more than ${max}`);
    }

    return null;
  };
}

export function childrenOfLength({ min, max, exact }) {
  return function (props, propName, componentName) {
    // eslint-disable-next-line react/destructuring-assignment
    const dupProps = { ...props };
    dupProps[propName] = Children.toArray(props[propName]);

    return arrayOfLength({ min, max, exact })(
      dupProps,
      propName,
      componentName,
    );
  };
}
