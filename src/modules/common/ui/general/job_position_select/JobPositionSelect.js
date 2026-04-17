import React, { useEffect, useCallback, useState } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

import { apiRequest } from '@common/api/utils';

function JobPositionSelect({ label = 'Select your current role', onChange = () => {}, ...remainingProps }) {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    let mounted = true;
    apiRequest(
      'GET',
      '/jobs/get-job-profiles',
    ).then(({ data }) => mounted && setPositions(
      data.map(value => ({ label: value, value })),
    )).catch(() => mounted && setPositions([]));

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
      options={positions}
      {...remainingProps}
    />
  );
}

JobPositionSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default JobPositionSelect;
