import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';

import * as CustomPropTypes from '@common/utils/propTypes';
import { isFunction } from '@common/utils/type';
import FormContext from './context';
import { withGTMTracking } from '@common/ui/hoc';

/**
 * Can be used to connect formStore with any custom input as long as
 * it's `onChange`, `onBlur` spec is similar to standard html input and
 * also should expose the ref to the underlying DOM(Should strictly
 * be ref to DOM element and not a class based component) element.
 */
function Input({
  component = 'input',
  name,
  onChange,
  valueReducer,
  valueKey = 'value',
  isDisabled,
  ...remainingProps
}) {
  const { formActions, formState } = useContext(FormContext);

  const handleChange = useCallback(event => {
    let value = event.target[valueKey];
    if (valueReducer && isFunction(valueReducer)) {
      value = valueReducer(value);
    }
    formActions.updateField(name, value);
    formActions.updateFieldError(name, null);
    // eslint-disable-next-line no-unused-expressions
    onChange && onChange(event);
  }, [formActions, name, onChange, valueKey, valueReducer]);

  const value = formState.fields[name];

  return React.createElement(
    component,
    {
      name,
      onChange: handleChange,
      [valueKey]: value,
      disabled: isDisabled,
      ...remainingProps,
    },
  );
}

Input.propTypes = {
  component: CustomPropTypes.componentPropType.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  valueReducer: PropTypes.func,
  valueKey: PropTypes.string.isRequired,
};

export default withGTMTracking(Input);
