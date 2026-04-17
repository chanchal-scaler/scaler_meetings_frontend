import { createContext } from 'react';

const SelectContext = createContext({
  options: [],
  value: [],
  showInput: false,
  internalValue: '',
});

export default SelectContext;
