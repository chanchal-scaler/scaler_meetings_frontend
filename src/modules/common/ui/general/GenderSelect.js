import React, { useEffect, useCallback, useState } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

function GenderSelect({ label = 'Select your Gender', onChange = () => {}, ...remainingProps }) {
  const [genders, setGenders] = useState([]);

  useEffect(() => {
    setGenders([
      {
        label: 'Male',
        value: 'male',
      },
      {
        label: 'Female',
        value: 'female',
      },
      {
        label: 'Other',
        value: 'other',
      },
    ]);
  }, []);

  const handlePositionCollege = useCallback(
    (inputValue) => {
      const event = { target: { value: inputValue.value } };
      onChange(event);
    },
    [onChange],
  );

  return (
    <Select
      onChange={handlePositionCollege}
      placeholder={label}
      options={genders}
      {...remainingProps}
    />
  );
}

GenderSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default GenderSelect;
