import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import difference from 'lodash/difference';
import remove from 'lodash/remove';
import union from 'lodash/union';

import { applyFiltersAndSort } from './utils';
import { FILTER_TYPES, SORT_ORDERS } from './constants';
import { forwardRef } from '@common/ui/hoc';
import { isFunction, isNullOrUndefined } from '@common/utils/type';
import { warn } from '@common/utils/debug';
import DataTableBody from './DataTableBody';
import DataTableContext from './context';
import DataTableHeader from './DataTableHeader';
import HintLayout from '@common/ui/layouts/HintLayout';

function DataTable({
  className,
  columns,
  containerClassName,
  forwardedRef,
  initialFilters = [],
  initialSort,
  isHeaderSticky = true,
  list,
  onSelection,
  predicate,
  rowClassName,
  selectable = false,
  showClearFilters = true,
  ...remainingProps
}) {
  /* Refs */
  const elementRef = useRef(null);

  /* State Hooks */
  const [internalList, setInternalList] = useState([...list]);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState([...initialFilters]);
  const [sort, setSort] = useState(initialSort ? { ...initialSort } : null);

  /* Memoized values */
  const areAllRowsSelected = useMemo(() => {
    if (isFunction(predicate)) {
      const visibleRows = internalList.map(o => predicate(o));
      const notSelectedRows = difference(visibleRows, selected);
      return (notSelectedRows.length === 0);
    } else {
      return false;
    }
  }, [internalList, predicate, selected]);

  /* Effect Hooks */

  // Only using this hook for rendering warnings
  useEffect(() => {
    if (selectable) {
      if (isNullOrUndefined(predicate)) {
        warn('A predicate function is required if `selectable` is true');
      } else if (!isFunction(predicate)) {
        warn('predicate is should be a `function`');
      }
    }
  }, [predicate, selectable]);

  useEffect(() => {
    const finalFilters = filters.map(filter => {
      const column = columns.find(o => o.name === filter.column);
      return {
        ...filter,
        type: column.filterType || 'text',
        predicate: column.predicate,
      };
    });

    let finalSort = null;

    if (!isNullOrUndefined(sort)) {
      const column = columns.find(o => o.name === sort.column);
      finalSort = {
        ...sort,
        predicate: column.predicate,
      };
    }

    const filteredAndSortedList = applyFiltersAndSort(
      list,
      finalFilters,
      finalSort,
    );
    setInternalList(filteredAndSortedList);
  }, [filters, sort, columns, list]);

  /* Methods to apply sort */

  const applySort = useCallback((column, order) => {
    setSort({ column, order });
  }, []);

  // eslint-disable-next-line no-unused-vars
  const removeSort = useCallback(() => {
    setSort(null);
  }, []);

  /* Methods to apply filters */

  const applyFilter = useCallback((column, condition) => {
    const clonedFilters = [...filters];
    const appliedFilter = clonedFilters.find(o => o.column === column);
    if (appliedFilter) {
      appliedFilter.condition = condition;
    } else {
      clonedFilters.push({
        column,
        condition,
      });
    }
    setFilters(clonedFilters);
  }, [filters]);

  const removeFilter = useCallback((column) => {
    const clonedFilters = [...filters];
    remove(clonedFilters, (o) => o.column === column);
    setFilters(clonedFilters);
  }, [filters]);

  const removeAllFilters = useCallback(() => {
    setFilters([]);
  }, []);

  /* Methods to select rows */

  const selectRows = useCallback((newSelected = []) => {
    const finalSelected = union(selected, newSelected);
    setSelected(finalSelected);

    if (onSelection) {
      onSelection(finalSelected);
    }
  }, [onSelection, selected]);

  const unselectRows = useCallback((newUnselected = []) => {
    const finalSelected = difference(selected, newUnselected);
    setSelected(finalSelected);

    if (onSelection) {
      onSelection(finalSelected);
    }
  }, [onSelection, selected]);

  /* Ref handling */

  const attachRef = useCallback(el => {
    elementRef.current = el;

    if (typeof forwardedRef === 'function') {
      forwardedRef(el);
    } else if (forwardedRef) {
      // eslint-disable-next-line no-param-reassign
      forwardedRef.current = el;
    }
  }, [forwardedRef]);

  // Attached methods to ref so that filters and sort can be applied from
  // outside the `DataTable` component.
  useImperativeHandle(forwardedRef, () => ({
    applyFilter,
    applySort,
    removeAllFilters,
    removeFilter,
    removeSort,
    selectRows,
    unselectRows,
  }));

  /* UI renderer helpers */

  function ui() {
    return (
      <div
        className={classNames(
          'data-table-container',
          { [containerClassName]: containerClassName },
        )}
      >
        <table
          ref={attachRef}
          className={classNames(
            'data-table',
            { 'data-table--sticky-header': isHeaderSticky },
            { [className]: className },
          )}
          {...remainingProps}
        >
          <DataTableHeader />
          <DataTableBody />
        </table>
        {internalList.length === 0 && (
          showClearFilters ? (
            <div className="data-table-empty">
              <HintLayout
                isFit
                actionFn={removeAllFilters}
                actionLabel="Clear Filters"
                message="No matching results"
              />
            </div>
          ) : (
            <div className="row flex-c m-v-20">
              <p>No matching results</p>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <DataTableContext.Provider
      value={{
        columns,
        list: internalList,
        filters,
        predicate,
        selectable,
        sort,
        applyFilter,
        applySort,
        areAllRowsSelected,
        removeAllFilters,
        removeFilter,
        removeSort,
        rowClassName,
        selected,
        selectRows,
        unselectRows,
      }}
    >
      {ui()}
    </DataTableContext.Provider>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      predicate: PropTypes.func,
      sortable: PropTypes.bool,
      filterable: PropTypes.bool,
      filterType: PropTypes.oneOf(FILTER_TYPES),
      itemRenderer: PropTypes.func,
    }),
  ).isRequired,
  containerClassName: PropTypes.string,
  initialFilters: PropTypes.array.isRequired,
  initialSort: PropTypes.exact({
    column: PropTypes.string.isRequired,
    order: PropTypes.oneOf(Object.values(SORT_ORDERS)),
  }),
  list: PropTypes.array.isRequired,
  onSelection: PropTypes.func,
  predicate: PropTypes.func,
  rowClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  selectable: PropTypes.bool.isRequired,
  showClearFilters: PropTypes.bool,
};

export default forwardRef(DataTable);
