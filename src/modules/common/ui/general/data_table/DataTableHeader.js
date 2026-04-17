import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';

import DataTableContext from './context';
import DataTableFilter from './DataTableFilter';
import DataTableSort from './DataTableSort';

function DataTableHeader() {
  const {
    areAllRowsSelected,
    columns,
    list,
    predicate,
    selectable,
    selectRows,
    unselectRows,
  } = useContext(DataTableContext);

  /* Handlers */
  const handleChange = useCallback((event) => {
    const rowIds = list.map(o => predicate(o));
    if (event.target.checked) {
      selectRows(rowIds);
    } else {
      unselectRows(rowIds);
    }
  }, [list, predicate, selectRows, unselectRows]);

  /* UI Renderers */

  function headerItemUi(column) {
    const isActionable = column.sortable || column.filterable;
    return (
      <th
        key={`header/${column.name}`}
        className={classNames(
          'data-table__col',
          column.headerClassName,
          { 'data-table__col--fixed': column.fixed },
        )}
      >
        <div className="data-table__header-item">
          <div className="data-table__header-label">
            {column.label}
          </div>
          {isActionable && (
            <div className="data-table__header-actions">
              {column.sortable && <DataTableSort column={column.name} />}
              {column.filterable && <DataTableFilter column={column.name} />}
            </div>
          )}
        </div>
      </th>
    );
  }

  function selectRowUi() {
    if (selectable) {
      return (
        <th className="data-table__col data-table__col--select">
          <label className="cursor">
            <input
              onChange={handleChange}
              type="checkbox"
              checked={areAllRowsSelected}
            />
          </label>
        </th>
      );
    } else {
      return null;
    }
  }

  return (
    <thead className="data-table__header">
      <tr className="data-table__row">
        {selectRowUi()}
        {columns.map(headerItemUi)}
      </tr>
    </thead>
  );
}

export default DataTableHeader;
