import React, {
  useCallback, useContext, useRef, useState,
} from 'react';
import classNames from 'classnames';

import { NumberFilter, SelectFilter, TextFilter } from './filters';
import { useOutsideClick } from '@common/hooks';
import DataTableContext from './context';
import Icon from '@common/ui/general/Icon';
import Popover from '@common/ui/general/Popover';
import Tappable from '@common/ui/general/Tappable';

function DataTableFilter({ column }) {
  /* Refs */
  const ref = useRef();
  const popoverRef = useRef();

  /* State */
  const [isOpen, setOpen] = useState(false);

  const handleFilterToggle = useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen]);

  const handleFilterClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOutsideClick = useCallback((event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setOpen(false);
    }
  }, []);

  useOutsideClick(ref, handleOutsideClick);

  const { columns, filters } = useContext(DataTableContext);
  const isFilterApplied = filters.some(filter => filter.column === column);

  function filterUi() {
    const columnItem = columns.find(o => o.name === column);
    const filterType = columnItem.filterType || 'text';
    switch (filterType) {
      case 'text':
        return (
          <TextFilter
            column={column}
            onCloseRequest={handleFilterToggle}
          />
        );
      case 'number':
        return (
          <NumberFilter
            column={column}
            onCloseRequest={handleFilterToggle}
          />
        );
      case 'select':
        return (
          <SelectFilter
            column={column}
            onCloseRequest={handleFilterToggle}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Tappable
        ref={ref}
        className={classNames(
          'btn btn-light btn-small',
          'data-table__action data-table__action--filter',
          { 'data-table__action--active': isFilterApplied },
        )}
        onClick={handleFilterToggle}
      >
        <Icon name="filter" />
      </Tappable>
      <Popover
        ref={popoverRef}
        anchorRef={ref}
        className="data-table__popover card"
        isOpen={isOpen}
        onClose={handleFilterClose}
      >
        {filterUi()}
      </Popover>
    </>
  );
}

export default DataTableFilter;
