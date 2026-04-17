import React, { useEffect, useCallback, useState } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

import { apiRequest } from '@common/api/utils';

function DegreeSelect({ label = 'Select your current degree', onChange = () => {}, ...remainingProps }) {
  const [degrees, setDegrees] = useState([]);

  useEffect(() => {
    let mounted = true;
    apiRequest(
      'GET',
      '/get-all-degrees',
    ).then(({ data }) => mounted && setDegrees(
      data.map(value => ({ label: value, value })),
    )).catch(() => mounted && setDegrees([]));

    return () => {
      mounted = false;
    };
  }, []);

  const handlePositionCollege = useCallback(
    (inputValue) => {
      const event = { target: { value: inputValue.label } };
      onChange(event);
    },
    [onChange],
  );

  return (
    <Select
      onChange={handlePositionCollege}
      placeholder={label}
      options={degrees}
      {...remainingProps}
    />
  );
}

DegreeSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default DegreeSelect;
