import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Table({
  className,
  cellClassName,
  headerData,
  rowsData,
  banner,
  headerClassName,
  headerItemClassName,
  onRowClick,
  rowClassName,
  rowItemClassName,
  ...remainingProps
}) {
  return (
    <table
      className={classNames(
        'table',
        { [className]: className },
      )}
      {...remainingProps}
    >
      <tbody>
        <tr
          className={classNames(
            'table__row',
            { [headerClassName]: headerClassName },
          )}
        >
          {headerData.map((header, i) => (
            <th
              key={i}
              className={classNames(
                'table__head',
                { [headerItemClassName]: headerItemClassName },
                { [header.className]: header.className },
              )}
            >
              {header.label}
            </th>
          ))}
        </tr>
        {banner && (
          <tr className="table__row">
            <td colSpan={headerData?.length} className="p-20">
              {banner}
            </td>
          </tr>
        )}
        {rowsData.map((row, i) => (
          <tr
            key={i}
            className={classNames(
              'table__row',
              { [rowClassName]: rowClassName },
              { [row.className]: row.className },
            )}
            onClick={() => onRowClick && onRowClick(row, i)}
          >
            {headerData.map((header, j) => (
              <td
                key={j}
                className={classNames(
                  'table__data',
                  { table__decider: header.decider },
                  { [rowItemClassName]: rowItemClassName },
                )}
              >
                {header.itemRenderer
                  ? header.itemRenderer(row[header.name], row, i)
                  : row[header.name]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}


Table.propTypes = {
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  headerData: PropTypes.array.isRequired,
  headerItemClassName: PropTypes.string,
  onRowClick: PropTypes.func,
  rowClassName: PropTypes.string,
  rowItemClassName: PropTypes.string,
  rowsData: PropTypes.array.isRequired,
  cellClassName: PropTypes.string,
};

export default Table;
