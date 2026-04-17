import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';

import DataTableContext from '../context';
import Field from '@common/ui/form/Field';
import Tappable from '@common/ui/general/Tappable';

function NumberFilter({ column, onCloseRequest }) {
  /* State Hooks */
  const [lt, setLt] = useState('');
  const [gt, setGt] = useState('');
  const [eq, setEq] = useState('');

  const { applyFilter, filters, removeFilter } = useContext(DataTableContext);
  const filter = filters.find(o => o.column === column);

  useEffect(() => {
    setLt(filter ? filter.condition.lt : '');
    setGt(filter ? filter.condition.gt : '');
    setEq(filter ? filter.condition.eq : '');
  }, [filter]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    applyFilter(column, { lt, gt, eq });
    onCloseRequest();
  }, [applyFilter, column, eq, gt, lt, onCloseRequest]);

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
          type="number"
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
      className="form data-table-form data-table-form--number"
      onSubmit={handleSubmit}
    >
      {inputUi(
        'Less than',
        lt,
        (event) => setLt(event.target.value),
        true,
      )}
      {inputUi(
        'Greater than',
        gt,
        (event) => setGt(event.target.value),
      )}
      {inputUi(
        'Equal to',
        eq,
        (event) => setEq(event.target.value),
      )}
      <div className="data-table-form__actions">
        {clearUi()}
        {submitUi()}
      </div>
    </form>
  );
}

export default NumberFilter;
