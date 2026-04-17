import React, { useCallback } from 'react';
import AsyncSelect from 'react-select/async';

import { DEBOUNCE_DURATION } from '~meetings/utils/quiz';
import { mobxify } from '~meetings/ui/hoc';
import debounce from '@common/utils/debounce';

function TopicSelect({
  title,
  api,
  meetingStore,
  placeholder,
  handleFilterChange,
  filterValue,
}) {
  const { slug } = meetingStore;

  let selectedOption = null;
  if (filterValue !== '') {
    selectedOption = { value: filterValue, label: filterValue };
  }

  const handleLoadOptions = useCallback(debounce(async (query, cb) => {
    try {
      const { data } = await api(slug, { keyword: query });
      cb(data);
    } catch (error) {
      cb([]);
    }
  }, DEBOUNCE_DURATION), [api, slug]);

  const handleChange = useCallback((selectedOptn) => {
    handleFilterChange(selectedOptn.value);
  }, [handleFilterChange]);

  return (
    <div className="mcq-hq-filter__container">
      <AsyncSelect
        value={selectedOption}
        defaultOptions={[{ value: '', label: title }]}
        className="mcq-hq-filter__filter-item"
        loadOptions={handleLoadOptions}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export default mobxify('quizStore')(TopicSelect);
