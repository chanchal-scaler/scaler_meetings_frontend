import React, { useEffect, useCallback, useState } from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';

/**
 * Creates a react-select dropdown fully compatible with ReduxForm.
 * Pass in your options as an Array with label and value as keys.
 * onChange is directly passed from Input component in ReduxForm.
 * @param {Object|Array} data
 * @param {string} label
 * @param {function} onChange
 * @param {Object} remainingProps
 * @returns {JSX.Element}
 */
function Select({
  options,
  label = 'Select options',
  onChange = () => {},
  ...remainingProps
}) {
  const [internalOptions, setInternalOptions] = useState([]);

  useEffect(() => {
    setInternalOptions(
      Object.keys(options).map((option) => (
        { label: options[option], value: option }
      )),
    );
  }, [options]);
  const handleChange = useCallback(
    (inputValue) => {
      const event = { target: { value: inputValue.value } };
      onChange(event);
    },
    [onChange],
  );

  return (
    <ReactSelect
      onChange={handleChange}
      placeholder={label}
      options={internalOptions}
      {...remainingProps}
    />
  );
}

Select.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default Select;
