import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';

import DataTableContext from '../context';
import Field from '@common/ui/form/Field';
import Tappable from '@common/ui/general/Tappable';

function TextFilter({ column, onCloseRequest }) {
  /* State Hooks */
  const [kw, setKw] = useState('');

  const { applyFilter, filters, removeFilter } = useContext(DataTableContext);
  const filter = filters.find(o => o.column === column);

  useEffect(() => {
    setKw(filter ? filter.condition.kw : '');
  }, [filter]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    applyFilter(column, { kw });
    onCloseRequest();
  }, [applyFilter, column, kw, onCloseRequest]);

  const handleClear = useCallback(() => {
    removeFilter(column);
    onCloseRequest();
  }, [column, onCloseRequest, removeFilter]);

  function inputUi(label, value, handleChange, autoFocus = false) {
    return (
      <Field label={label}>
        <input
          autoFocus={autoFocus}
          onChange={handleChange}
          type="text"
          value={value}
        />
      </Field>
    );
  }

  function submitUi() {
    return (
      <Tappable
        className="btn btn-primary btn-small"
        component="button"
        type="submit"
      >
        Apply
      </Tappable>
    );
  }

  function clearUi() {
    return (
      <Tappable
        className="btn btn-primary btn-inverted btn-small m-r-10"
        component="a"
        disabled={!filter}
        onClick={handleClear}
      >
        Clear
      </Tappable>
    );
  }

  return (
    <form
      className="form data-table-form data-table-form--text"
      onSubmit={handleSubmit}
    >
      {inputUi(
        'Keyword',
        kw,
        (event) => setKw(event.target.value),
        true,
      )}
      <div className="data-table-form__actions">
        {clearUi()}
        {submitUi()}
      </div>
    </form>
  );
}

export default TextFilter;
