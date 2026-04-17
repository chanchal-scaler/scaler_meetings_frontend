/* eslint-disable no-restricted-globals */
import orderBy from 'lodash/orderBy';

import {
  isArray, isFunction, isNullOrUndefined, isString,
} from '@common/utils/type';

function _normalize(str) {
  return (str === null) ? '' : str.trim().toLowerCase().replace(/\s/g, '');
}

function _predicateFn({ column, predicate }) {
  if (isFunction(predicate)) {
    return predicate;
  } else {
    return (o) => o[column];
  }
}

function _applySort(list, sort) {
  if (isNullOrUndefined(sort)) {
    return list;
  } else {
    return orderBy(
      list,
      _predicateFn(sort),
      [sort.order],
    );
  }
}

const Filters = {
  text(list, filter) {
    const predicate = _predicateFn(filter);
    const normalizedKw = _normalize(filter.condition.kw);
    if (normalizedKw) {
      return list.filter(
        o => _normalize(predicate(o)).includes(normalizedKw),
      );
    } else {
      return list;
    }
  },
  number(list, filter) {
    const predicate = _predicateFn(filter);
    let { eq, lt, gt } = filter.condition;
    eq = parseInt(eq, 10);
    lt = parseInt(lt, 10);
    gt = parseInt(gt, 10);

    if (isNaN(lt)) lt = Infinity;
    if (isNaN(gt)) gt = -Infinity;

    return list.filter(o => {
      const value = predicate(o);
      const eqMatch = !isNaN(eq) && eq === value;
      const rangeMatch = (value >= gt) && (value <= lt);
      return eqMatch || rangeMatch;
    });
  },
  select(list, filter) {
    const predicate = _predicateFn(filter);
    const { values } = filter.condition;
    if (isArray(values) && values.length > 0) {
      return list.filter(o => {
        const value = predicate(o);
        return values.includes(value);
      });
    } else {
      return list;
    }
  },
};

function _applyFilters(list, filters) {
  const hasNoFilters = filters.length === 0;
  if (hasNoFilters) {
    return list;
  } else {
    let filteredList = list;
    filters.forEach(filter => {
      filteredList = Filters[filter.type](filteredList, filter);
    });
    return filteredList;
  }
}

// eslint-disable-next-line import/prefer-default-export
export function applyFiltersAndSort(list, filters, sort) {
  const filteredList = _applyFilters(list, filters);
  const sortedList = _applySort(filteredList, sort);
  return sortedList;
}


export function getRowClassName({
  rowClassName, rowIndex, item, list,
}) {
  if (isString(rowClassName)) {
    return rowClassName;
  } else if (isFunction(rowClassName)) {
    return rowClassName(rowIndex, item, list);
  } else {
    return null;
  }
}
