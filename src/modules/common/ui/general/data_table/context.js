import { createContext } from 'react';

const DataTableContext = createContext({
  filters: [],
  sort: null,
  list: [],
  columns: [],
  rowClassName: null,
});

export default DataTableContext;
