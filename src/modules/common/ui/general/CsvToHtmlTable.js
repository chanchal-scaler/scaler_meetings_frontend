import React, { useMemo } from 'react';
import classNames from 'classnames';

import { parseCsvToRowsAndColumn } from '@common/utils/csv';

function TableHeader({ headerRow, headerClassName }) {
  if (headerRow) {
    return (
      <tr className={classNames(
        'table__row',
        { [headerClassName]: headerClassName },
      )}
      >
        {headerRow.map((column, i) => (
          <th key={`header-${i}`}>
            {column}
          </th>
        ))}
      </tr>
    );
  } else {
    return null;
  }
}

function TableBody({ bodyRows, rowClassName, rowItemClassName }) {
  if (bodyRows) {
    return (bodyRows.map((row, rowIdx) => (
      <tr
        className={classNames(
          'table__row',
          { [rowClassName]: rowClassName },
        )}
        key={rowIdx}
      >
        {row.map && row.map((column, colIdx) => (
          <td
            className={classNames(
              'table__data',
              { [rowItemClassName]: rowItemClassName },
            )}
            key={colIdx}
          >
            {column}
          </td>
        ))}
      </tr>
    )));
  } else {
    return null;
  }
}

const CsvToHtmlTable = ({
  data = '',
  csvDelimiter = '\t',
  hasHeader = true,
  className,
  headerClassName,
  rowClassName,
  rowItemClassName,
  ...remainingProps
}) => {
  const rowsWithColumns = useMemo(() => (
    parseCsvToRowsAndColumn(data.trim(), csvDelimiter)
  ), [data, csvDelimiter]);

  const headerRow = hasHeader ? rowsWithColumns[0] : null;
  const bodyRows = hasHeader ? rowsWithColumns.slice(1) : rowsWithColumns;

  return (
    <table
      className={classNames(
        'table',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <tbody>
        <TableHeader
          headerRow={headerRow}
          headerClassName={headerClassName}
        />
        <TableBody
          bodyRows={bodyRows}
          headerClassName={headerClassName}
          rowClassName={rowClassName}
          rowItemClassName={rowItemClassName}
        />
      </tbody>
    </table>
  );
};

export default CsvToHtmlTable;
