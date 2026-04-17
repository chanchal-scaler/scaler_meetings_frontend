import React, { useCallback, useRef } from 'react';
import AsyncCreatable from 'react-select/async-creatable';
import PropTypes from 'prop-types';

import { apiRequest } from '@common/api/utils';

function CompanySelect({ label = 'Company Name ( at least 3 characters )', onChange = () => {}, ...remainingProps }) {
  const timeout = useRef();
  const filterCompanies = useCallback(async inputValue => {
    if (inputValue.length >= 3) {
      const json = await apiRequest(
        'GET',
        `/academy/get-companies?q=${inputValue}&format=0`,
      );
      const companies = json.data || json.items;
      return companies.filter(
        i => i.label.toLowerCase().includes(inputValue.toLowerCase()),
      );
    } else {
      return [];
    }
  }, []);

  const promiseOptions = useCallback((inputValue) => new Promise((resolve) => {
    if (timeout?.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      resolve(filterCompanies(inputValue));
    }, 1000);
  }), [filterCompanies]);

  const handleChangeCompany = useCallback(
    (inputValue) => {
      const event = {
        target: { key: inputValue.value, value: inputValue.label },
      };
      onChange(event);
    },
    [onChange],
  );

  return (
    <AsyncCreatable
      onChange={handleChangeCompany}
      cacheOptions
      defaultOptions
      loadOptions={promiseOptions}
      placeholder={label}
      options={[]}
      {...remainingProps}
    />
  );
}

CompanySelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default CompanySelect;
