import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';

import { SORT_ORDERS } from './constants';
import DataTableContext from './context';
import Icon from '@common/ui/general/Icon';
import Tappable from '@common/ui/general/Tappable';

const sortOrderIconsMap = {
  neutral: 'sort',
  asc: 'sort-asc',
  desc: 'sort-desc',
};

function DataTableSort({ column }) {
  const {
    applySort,
    sort,
  } = useContext(DataTableContext);

  const isSortApplied = sort && (sort.column === column);
  const order = isSortApplied ? sort.order : 'neutral';

  const handleSortUpdate = useCallback(() => {
    const newOrder = (order === SORT_ORDERS.asc)
      ? SORT_ORDERS.desc
      : SORT_ORDERS.asc;
    applySort(column, newOrder);
  }, [applySort, column, order]);

  return (
    <Tappable
      className={classNames(
        'btn btn-light btn-small',
        'data-table__action data-table__action--sort',
        { 'data-table__action--active': isSortApplied },
      )}
      onClick={handleSortUpdate}
    >
      <Icon name={sortOrderIconsMap[order]} />
    </Tappable>
  );
}

export default DataTableSort;
