import React, { useCallback } from 'react';
import AsyncCreatable from 'react-select/async-creatable';
import PropTypes from 'prop-types';

import { apiRequest } from '@common/api/utils';


function CollegeSelect({ label = 'College Name', onChange = () => {}, ...remainingProps }) {
  const filterColleges = useCallback(async inputValue => {
    if (inputValue.length) {
      const json = await apiRequest(
        'GET',
        `/get-universities?q=${inputValue}`,
      );
      const colleges = json.items;
      colleges.forEach(college => {
        // eslint-disable-next-line no-param-reassign
        college.label = college.text;
      });
      return colleges.filter(
        i => i.label.toLowerCase().includes(inputValue.toLowerCase()),
      );
    } else {
      return [];
    }
  }, []);

  const promiseOptions = useCallback(
    (inputValue) => new Promise((resolve) => {
      setTimeout(() => {
        resolve(filterColleges(inputValue));
      }, 1000);
    }),
    [filterColleges],
  );

  const handleChangeCollege = useCallback(
    (inputValue) => {
      const event = { target: { value: inputValue.label } };
      onChange(event);
    },
    [onChange],
  );

  return (
    <AsyncCreatable
      onChange={handleChangeCollege}
      cacheOptions
      defaultOptions
      loadOptions={promiseOptions}
      placeholder={label}
      options={[]}
      {...remainingProps}
    />
  );
}

CollegeSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default CollegeSelect;
