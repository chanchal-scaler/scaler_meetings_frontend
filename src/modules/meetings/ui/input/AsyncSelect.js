import { apiRequest } from '@common/api/utils';
import React, { useCallback } from 'react';
import AsyncCreatable from 'react-select/async-creatable';
import PropTypes from 'prop-types';

function AsyncSelect({
  getUrl, label = 'Type here..', onChange = () => { }, ...remainingProps
}) {
  const filterOptions = useCallback(async inputValue => {
    if (inputValue.length >= 2) {
      const url = getUrl(inputValue);
      const json = await apiRequest('GET', url);
      const options = json.items;
      return options.filter(
        i => i.label?.toLowerCase()?.includes(inputValue?.toLowerCase()),
      ).map(item => ({
        ...item,
        label: item.label,
      }));
    } else {
      return [];
    }
  }, [getUrl]);

  const loadOptions = useCallback(
    (inputValue) => filterOptions(inputValue),
    [filterOptions],
  );

  const handleChangeOption = useCallback(
    (option) => {
      onChange(option.label);
    },
    [onChange],
  );

  return (
    <AsyncCreatable
      onChange={handleChangeOption}
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      placeholder={label}
      options={[]}
      {...remainingProps}
    />
  );
}

AsyncSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

export default AsyncSelect;
