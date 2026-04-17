import React, { useCallback, useContext, useState } from 'react';
import classNames from 'classnames';

import { getRowClassName } from './utils';
import DataTableContext from './context';


function DataTableBody() {
  const {
    columns,
    list,
    predicate,
    selectable,
    selected,
    selectRows,
    unselectRows,
    rowClassName,
  } = useContext(DataTableContext);
  const [activeRow, setActiveRow] = useState(-1);

  /* Handler */

  const handleRowSelect = useCallback((event, item) => {
    const id = predicate(item);
    if (event.target.checked) {
      selectRows([id]);
    } else {
      unselectRows([id]);
    }
  }, [predicate, selectRows, unselectRows]);

  function columnUi(item, column, rowIndex, colIndex) {
    return (
      <td
        key={`row/${rowIndex}/column/${column.name}/${colIndex}`}
        className={classNames(
          'data-table__col', column.className,
          { 'data-table__col--fixed': column.fixed },
        )}
      >
        {column.itemRenderer
          ? column.itemRenderer(item[column.name], item, column.name)
          : item[column.name]}
      </td>
    );
  }

  function selectRowUi(item) {
    if (selectable) {
      const id = predicate(item);
      const isSelected = selected.includes(id);
      return (
        <td
          className="data-table__col data-table__col--select"
        >
          <label className="cursor">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={event => handleRowSelect(event, item)}
            />
          </label>
        </td>
      );
    } else {
      return null;
    }
  }

  function rowUi(item, rowIndex) {
    return (
      <tr
        key={rowIndex}
        className={classNames(
          'data-table__row',
          { 'data-table__row--active': activeRow === rowIndex },
          getRowClassName({
            rowClassName, rowIndex, item, list,
          }),
        )}
        onClick={() => setActiveRow(rowIndex)}
      >
        {selectRowUi(item, rowIndex)}
        {columns.map(
          (column, colIndex) => columnUi(item, column, rowIndex, colIndex),
        )}
      </tr>
    );
  }

  return (
    <tbody className="data-table__body">
      {list.map(rowUi)}
    </tbody>
  );
}

export default DataTableBody;
