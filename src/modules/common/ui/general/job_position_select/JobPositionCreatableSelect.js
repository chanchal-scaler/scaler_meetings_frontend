import React, { useCallback } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';

import { apiRequest } from '@common/api/utils';
import debounce from '@common/utils/debounce';

const DEBOUNCED_DURATION = 400; // milliseconds

function JobPositionCreatableSelect({ onChange }) {
  const handleLoadOptions = useCallback(debounce(async (value, cb) => {
    if (!value || value.trim().length === 0) {
      return cb([]);
    }

    try {
      const json = await apiRequest(
        'GET',
        '/user/work-experience/roles',
        null,
        { params: { q: value.trim() } },
      );

      const data = json.items.map((item) => ({
        label: item.text,
        value: item.text,
        target: {
          value: item.text,
        },
      }));

      return cb(data);
    } catch (error) {
      return cb([]);
    }
  }, DEBOUNCED_DURATION), []);

  const handleChange = useCallback((selectedVal) => {
    onChange({
      label: selectedVal.label,
      value: selectedVal.label,
      target: {
        value: selectedVal.label,
      },
    });
  }, [onChange]);

  return (
    <AsyncCreatableSelect
      onChange={handleChange}
      cacheOptions
      defaultOptions
      loadOptions={handleLoadOptions}
    />
  );
}

export default JobPositionCreatableSelect;
