import React, { useCallback } from 'react';

import { DEBOUNCE_DURATION } from '~meetings/utils/quiz';
import { mobxify } from '~meetings/ui/hoc';
import { Textarea } from '@common/ui/general';
import debounce from '@common/utils/debounce';

function QuizSearch({ placeholder, quizStore: store }) {
  const handleSearch = useCallback(debounce((event) => {
    store.setSearchQuery(event.target.value);
  }, DEBOUNCE_DURATION), [store]);

  function searchUi() {
    return (
      <Textarea
        className="mcq-hq-search__query"
        minRows={1}
        maxRows={2}
        onChange={handleSearch}
        placeholder={placeholder}
        value={store.searchQuery}
      />
    );
  }
  return (
    <div className="mcq-hq-search">
      {searchUi()}
    </div>
  );
}

export default mobxify('quizStore')(QuizSearch);
